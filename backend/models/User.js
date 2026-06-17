const mongoose = require('mongoose');
const { getConnected, JSONModel } = require('./dbAdapter');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true }, // Unique sign-in username
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Encrypted password string
  role: { type: String, required: true, enum: ['Farmer', 'Consumer'] },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', userSchema);
const JsonUser = new JSONModel('users.json');

const User = {
  find: async (query) => {
    if (getConnected()) {
      return MongoUser.find(query).sort({ createdAt: -1 });
    }
    return JsonUser.find(query);
  },
  findOne: async (query) => {
    if (getConnected()) {
      return MongoUser.findOne(query);
    }
    const results = await JsonUser.find(query);
    return results[0] || null;
  },
  findById: async (id) => {
    if (getConnected()) {
      return MongoUser.findById(id);
    }
    return JsonUser.findById(id);
  },
  create: async (data) => {
    if (getConnected()) {
      return MongoUser.create(data);
    }
    return JsonUser.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (getConnected()) {
      return MongoUser.findByIdAndUpdate(id, update, { new: true, ...options });
    }
    return JsonUser.findByIdAndUpdate(id, update, options);
  },
  findOneAndUpdate: async (query, update, options = {}) => {
    if (getConnected()) {
      return MongoUser.findOneAndUpdate(query, update, { new: true, ...options });
    }
    const user = await User.findOne(query);
    if (!user) return null;
    return JsonUser.findByIdAndUpdate(user._id || user.id, update, options);
  },
  findByIdAndDelete: async (id) => {
    if (getConnected()) {
      return MongoUser.findByIdAndDelete(id);
    }
    return JsonUser.findByIdAndDelete(id);
  }
};

// --- DATA CONSOLIDATION MIGRATION SCRIPTS ---

const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '../data');

// 1. JSON Consolidation
try {
  const farmersPath = path.join(DATA_DIR, 'farmers.json');
  const consumersPath = path.join(DATA_DIR, 'consumers.json');
  const usersPath = path.join(DATA_DIR, 'users.json');

  let merged = [];
  if (fs.existsSync(usersPath)) {
    try {
      merged = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    } catch (e) {
      merged = [];
    }
  }

  let migrated = false;

  if (fs.existsSync(farmersPath)) {
    console.log('[JSON Migration] Migrating farmers.json back into users.json...');
    const farmers = JSON.parse(fs.readFileSync(farmersPath, 'utf8'));
    merged = [...merged, ...farmers];
    fs.renameSync(farmersPath, path.join(DATA_DIR, 'farmers_backup.json'));
    migrated = true;
  }

  if (fs.existsSync(consumersPath)) {
    console.log('[JSON Migration] Migrating consumers.json back into users.json...');
    const consumers = JSON.parse(fs.readFileSync(consumersPath, 'utf8'));
    merged = [...merged, ...consumers];
    fs.renameSync(consumersPath, path.join(DATA_DIR, 'consumers_backup.json'));
    migrated = true;
  }

  if (migrated) {
    const unique = merged.filter((v, i, a) => a.findIndex(t => t.username === v.username) === i);
    fs.writeFileSync(usersPath, JSON.stringify(unique, null, 2));
    console.log('[JSON Migration] Local storage consolidation complete.');
  }
} catch (err) {
  console.error('[JSON Migration] Error consolidating JSON database files:', err);
}

// 2. MongoDB Consolidation
setTimeout(async () => {
  if (getConnected()) {
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);

      if (collectionNames.includes('farmers') || collectionNames.includes('consumers')) {
        console.log('[Database Migration] Consolidating farmers and consumers back into the users collection...');
        let migratedCount = 0;

        if (collectionNames.includes('farmers')) {
          const farmersData = await db.collection('farmers').find({}).toArray();
          for (const farmer of farmersData) {
            const exists = await MongoUser.findOne({ username: farmer.username });
            if (!exists) {
              await MongoUser.create(farmer);
              migratedCount++;
            }
          }
          await db.collection('farmers').rename('farmers_backup');
        }

        if (collectionNames.includes('consumers')) {
          const consumersData = await db.collection('consumers').find({}).toArray();
          for (const consumer of consumersData) {
            const exists = await MongoUser.findOne({ username: consumer.username });
            if (!exists) {
              await MongoUser.create(consumer);
              migratedCount++;
            }
          }
          await db.collection('consumers').rename('consumers_backup');
        }

        console.log(`[Database Migration] Database consolidation complete. Migrated ${migratedCount} users into "users".`);
      }
    } catch (err) {
      console.error('[Database Migration] Error consolidating MongoDB collections:', err);
    }
  }
}, 2000);

module.exports = User;

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmDirect';

// Consolidated Schema & Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Farmer', 'Consumer'] },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', userSchema);

const dummyFarmers = [
  { name: 'Green Valley Farm', username: 'greenvalley', email: 'greenvalley@gmail.com', role: 'Farmer', isVerified: true },
  { name: 'Sunset Organics', username: 'sunsetorganic', email: 'sunsetorganic@gmail.com', role: 'Farmer', isVerified: true },
  { name: 'Happy Cows Dairy', username: 'happycows', email: 'happycows@gmail.com', role: 'Farmer', isVerified: true },
  { name: 'Golden Fields', username: 'goldenfields', email: 'goldenfields@gmail.com', role: 'Farmer', isVerified: true },
  { name: 'Berry Bounty Farm', username: 'berrybounty', email: 'berrybounty@gmail.com', role: 'Farmer', isVerified: true }
];

const dummyConsumers = [
  { name: 'Alice Cooper', username: 'alicecooper', email: 'alice@gmail.com', role: 'Consumer', isVerified: true },
  { name: 'Bob Miller', username: 'bobmiller', email: 'bob@gmail.com', role: 'Consumer', isVerified: true },
  { name: 'Charlie Brown', username: 'charliebrown', email: 'charlie@gmail.com', role: 'Consumer', isVerified: true },
  { name: 'Diana Prince', username: 'dianaprince', email: 'diana@gmail.com', role: 'Consumer', isVerified: true },
  { name: 'Ethan Hunt', username: 'ethanhunt', email: 'ethan@gmail.com', role: 'Consumer', isVerified: true }
];

const allDummyUsers = [...dummyFarmers, ...dummyConsumers];

async function seed() {
  console.log('Starting unified database seeding...');
  
  // Encrypt the standard password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password123!', salt);
  
  // --- 1. Seed MongoDB ---
  let mongoConnected = false;
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');
    mongoConnected = true;

    for (const u of allDummyUsers) {
      const exists = await MongoUser.findOne({ username: u.username });
      if (!exists) {
        await MongoUser.create({ ...u, password: hashedPassword });
        console.log(`[MongoDB] Created User: ${u.username} (${u.role})`);
      } else {
        console.log(`[MongoDB] User ${u.username} already exists.`);
      }
    }
  } catch (err) {
    console.warn('Could not seed MongoDB. Proceeding to JSON seed only. Error:', err.message);
  }

  // --- 2. Seed JSON Fallback File ---
  const DATA_DIR = path.join(__dirname, 'data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const usersJsonPath = path.join(DATA_DIR, 'users.json');
  let jsonUsers = [];
  if (fs.existsSync(usersJsonPath)) {
    try {
      jsonUsers = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
    } catch (e) {
      jsonUsers = [];
    }
  }

  for (const u of allDummyUsers) {
    if (!jsonUsers.some(item => item.username === u.username)) {
      const newItem = {
        _id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
        ...u,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };
      jsonUsers.push(newItem);
      console.log(`[JSON] Created User: ${u.username} (${u.role})`);
    }
  }
  fs.writeFileSync(usersJsonPath, JSON.stringify(jsonUsers, null, 2));

  if (mongoConnected) {
    await mongoose.connection.close();
  }
  
  console.log('Unified seeding completed successfully!');
}

seed();

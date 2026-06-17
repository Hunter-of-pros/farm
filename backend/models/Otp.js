const mongoose = require('mongoose');
const { getConnected, JSONModel } = require('./dbAdapter');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // 10 minutes TTL
});

const MongoOtp = mongoose.model('Otp', otpSchema);
const JsonOtp = new JSONModel('otps.json');

const Otp = {
  findOne: async (query) => {
    if (getConnected()) {
      return MongoOtp.findOne(query);
    }
    const results = await JsonOtp.find(query);
    
    // Manually filter out items older than 10 minutes for JSON fallback
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const validResults = results.filter(item => new Date(item.createdAt) > tenMinutesAgo);
    
    return validResults[0] || null;
  },
  create: async (data) => {
    if (getConnected()) {
      return MongoOtp.create(data);
    }
    return JsonOtp.create(data);
  },
  deleteMany: async (query) => {
    if (getConnected()) {
      return MongoOtp.deleteMany(query);
    }
    const items = JsonOtp.read();
    const filtered = items.filter(item => {
      for (let key in query) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
    JsonOtp.write(filtered);
    return { deletedCount: items.length - filtered.length };
  }
};

module.exports = Otp;

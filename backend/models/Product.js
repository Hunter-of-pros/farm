const mongoose = require('mongoose');
const { getConnected, JSONModel } = require('./dbAdapter');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  quantity: { type: Number, required: true },
  description: { type: String },
  imageUrl: { type: String },
  farmerName: { type: String, required: true },
  farmerLocation: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongoProduct = mongoose.model('Product', productSchema);
const JsonProduct = new JSONModel('products.json');

const Product = {
  find: async (query) => {
    if (getConnected()) {
      // If we have a query with RegExp, Mongo works fine
      return MongoProduct.find(query).sort({ createdAt: -1 });
    }
    return JsonProduct.find(query);
  },
  findById: async (id) => {
    if (getConnected()) {
      return MongoProduct.findById(id);
    }
    return JsonProduct.findById(id);
  },
  create: async (data) => {
    if (getConnected()) {
      return MongoProduct.create(data);
    }
    return JsonProduct.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (getConnected()) {
      return MongoProduct.findByIdAndUpdate(id, update, { new: true, ...options });
    }
    return JsonProduct.findByIdAndUpdate(id, update, options);
  },
  findByIdAndDelete: async (id) => {
    if (getConnected()) {
      return MongoProduct.findByIdAndDelete(id);
    }
    return JsonProduct.findByIdAndDelete(id);
  }
};

module.exports = Product;

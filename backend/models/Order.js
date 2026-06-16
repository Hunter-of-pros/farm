const mongoose = require('mongoose');
const { getConnected, JSONModel } = require('./dbAdapter');

const orderSchema = new mongoose.Schema({
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    farmerName: { type: String, required: true }
  }],
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerAddress: { type: String, required: true },
  customerEmail: { type: String },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const MongoOrder = mongoose.model('Order', orderSchema);
const JsonOrder = new JSONModel('orders.json');

const Order = {
  find: async (query = {}) => {
    if (getConnected()) {
      return MongoOrder.find(query).sort({ createdAt: -1 });
    }
    return JsonOrder.find(query);
  },
  findById: async (id) => {
    if (getConnected()) {
      return MongoOrder.findById(id);
    }
    return JsonOrder.findById(id);
  },
  create: async (data) => {
    if (getConnected()) {
      return MongoOrder.create(data);
    }
    return JsonOrder.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (getConnected()) {
      return MongoOrder.findByIdAndUpdate(id, update, { new: true, ...options });
    }
    return JsonOrder.findByIdAndUpdate(id, update, options);
  }
};

module.exports = Order;

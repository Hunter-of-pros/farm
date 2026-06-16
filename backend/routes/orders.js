const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// Get all orders (for dashboards to read and filter)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status (Pending -> Shipped -> Delivered)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create a new order (Checkout)
router.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, customerEmail, items, totalAmount } = req.body;
    
    if (!customerName || !customerPhone || !customerAddress || !items || !items.length) {
      return res.status(400).json({ message: 'Missing required order details' });
    }
    
    // 1. Verify stock availability and prepare updates
    const updates = [];
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product '${item.name}' not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for '${item.name}'. Available: ${product.quantity}, Requested: ${item.quantity}` 
        });
      }
      updates.push({ productId: item.productId, decrementBy: -item.quantity });
    }
    
    // 2. Perform updates to product stock levels
    for (let u of updates) {
      await Product.findByIdAndUpdate(u.productId, { $inc: { quantity: u.decrementBy } });
    }
    
    // 3. Create the order record
    const newOrder = await Order.create({
      items,
      customerName,
      customerPhone,
      customerAddress,
      customerEmail: customerEmail || '',
      totalAmount: Number(totalAmount),
      status: 'Pending'
    });
    
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

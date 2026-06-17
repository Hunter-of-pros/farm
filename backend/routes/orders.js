const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// Get all orders (secured)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find();
    
    // Farmers can see all orders (they filter by their farm items in frontend)
    // Consumers should only see their own orders
    if (req.user.role === 'Consumer') {
      const consumerOrders = orders.filter(o => o.customerEmail.toLowerCase() === req.user.email.toLowerCase());
      return res.json(consumerOrders);
    }
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status (Farmer only)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Farmer') {
      return res.status(403).json({ message: 'Access denied. Only Farmers can update order status.' });
    }

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

// Create a new order (Secured checkout)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { customerPhone, customerAddress, items, totalAmount } = req.body;
    
    if (!customerPhone || !customerAddress || !items || !items.length) {
      return res.status(400).json({ message: 'Missing required order details' });
    }
    
    // Verify stock availability
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
    
    // Decrement stock
    for (let u of updates) {
      await Product.findByIdAndUpdate(u.productId, { $inc: { quantity: u.decrementBy } });
    }
    
    // Create order, using verified user details
    const newOrder = await Order.create({
      items,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone,
      customerAddress,
      totalAmount: Number(totalAmount),
      status: 'Pending'
    });
    
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

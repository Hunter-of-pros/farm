const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// Get all products (public route)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.name = new RegExp(search, 'i');
    }
    
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product listing (Farmer only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Farmer') {
      return res.status(403).json({ message: 'Access denied. Only registered Farmers can list produce.' });
    }

    const { name, category, price, unit, quantity, description, imageUrl, farmerLocation } = req.body;
    
    const resolvedCategory = category || Product.resolveCategory(name);
    
    if (!name || !resolvedCategory || !price || !quantity || !farmerLocation) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newProduct = await Product.create({
      name,
      category: resolvedCategory,
      price: Number(price),
      unit: unit || 'kg',
      quantity: Number(quantity),
      description: description || '',
      imageUrl: imageUrl || '',
      farmerName: req.user.name, // Link to verified name
      farmerLocation
    });
    
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product listing (Farmer only, owner only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Farmer') {
      return res.status(403).json({ message: 'Access denied. Only Farmers can edit listings.' });
    }

    const { name, category, price, unit, quantity, description, imageUrl, farmerLocation } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Owner verification
    if (product.farmerName.toLowerCase() !== req.user.name.toLowerCase()) {
      return res.status(403).json({ message: 'Access denied. You cannot modify another farmer\'s listing.' });
    }
    
    const resolvedCategory = category || (name ? Product.resolveCategory(name) : product.category);
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category: resolvedCategory,
        price: Number(price),
        unit: unit || 'kg',
        quantity: Number(quantity),
        description,
        imageUrl,
        farmerLocation
      }
    );
    
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product listing (Farmer only, owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Farmer') {
      return res.status(403).json({ message: 'Access denied. Only Farmers can delete listings.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Owner verification
    if (product.farmerName.toLowerCase() !== req.user.name.toLowerCase()) {
      return res.status(403).json({ message: 'Access denied. You cannot delete another farmer\'s listing.' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get products by current farmer (Farmer only)
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Farmer') {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const products = await Product.find({ farmerName: req.user.name });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

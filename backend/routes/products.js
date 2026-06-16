const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products (with optional filter / search)
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

// Create product listing
router.post('/', async (req, res) => {
  try {
    const { name, category, price, unit, quantity, description, imageUrl, farmerName, farmerLocation } = req.body;
    
    if (!name || !category || !price || !quantity || !farmerName || !farmerLocation) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newProduct = await Product.create({
      name,
      category,
      price: Number(price),
      unit: unit || 'kg',
      quantity: Number(quantity),
      description: description || '',
      imageUrl: imageUrl || '',
      farmerName,
      farmerLocation
    });
    
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product listing
router.put('/:id', async (req, res) => {
  try {
    const { name, category, price, unit, quantity, description, imageUrl, farmerName, farmerLocation } = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        price: Number(price),
        unit: unit || 'kg',
        quantity: Number(quantity),
        description,
        imageUrl,
        farmerName,
        farmerLocation
      }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product listing
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

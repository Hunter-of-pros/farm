const mongoose = require('mongoose');
const { getConnected, JSONModel } = require('./dbAdapter');

const PRODUCE_RULES = [
  { pattern: /\bapples?\b/i, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bbananas?\b/i, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\boranges?\b/i, image: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bmango(es)?\b/i, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bstrawberr(y|ies)\b/i, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bblueberr(y|ies)\b/i, image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\braspberr(y|ies)\b/i, image: 'https://images.unsplash.com/photo-1577069861033-55d04cec4efb?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bblackberr(y|ies)\b/i, image: 'https://images.unsplash.com/photo-1464306208223-e0b4495a5553?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bberr(y|ies)\b/i, image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpotato(es)?\b/i, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\btomato(es)?\b/i, image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bonion(s)?\b/i, image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcarrot(s)?\b/i, image: 'https://images.unsplash.com/photo-1598170845058-32b996a6bd11?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bgarlic(s)?\b/i, image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bgrapes?\b/i, image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpineapples?\b/i, image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\blemon(s)?\b/i, image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\blime(s)?\b/i, image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bspinach\b/i, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bbroccoli\b/i, image: 'https://images.unsplash.com/photo-1452967712862-0cca1839ff27?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcucumber(s)?\b/i, image: 'https://images.unsplash.com/photo-1449300079324-9643e4dc7dc9?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bwatermelon(s)?\b/i, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpepper(s)?\b/i, image: 'https://images.unsplash.com/photo-1563565312-8235f7536ff6?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bchili(es|s)?\b/i, image: 'https://images.unsplash.com/photo-1588252399615-53846665c829?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bchillies\b/i, image: 'https://images.unsplash.com/photo-1588252399615-53846665c829?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\blettuce(s)?\b/i, image: 'https://images.unsplash.com/photo-1622484211148-716598e04041?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcabbage(s)?\b/i, image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bmushroom(s)?\b/i, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bavocado(s)?\b/i, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcorn(s)?\b/i, image: 'https://images.unsplash.com/photo-1551754626-787f2e1a499d?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpapaya(s)?\b/i, image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpeach(es)?\b/i, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcherr(y|ies)\b/i, image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpears?\b/i, image: 'https://images.unsplash.com/photo-1601876819102-99560f772713?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bplums?\b/i, image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bwheat\b/i, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\brice\b/i, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bbarley\b/i, image: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpumpkin(s)?\b/i, image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\beggplant(s)?\b/i, image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bbrinjal(s)?\b/i, image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcauliflower(s)?\b/i, image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ec3?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bginger(s)?\b/i, image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bguava(s)?\b/i, image: 'https://images.unsplash.com/photo-1534444767776-8c159abd6850?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpomegranate(s)?\b/i, image: 'https://images.unsplash.com/photo-1530983824131-0968e715655d?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bpea(s)?\b/i, image: 'https://images.unsplash.com/photo-1587570256549-6ee00912f21b?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bbeet(s)?\b/i, image: 'https://images.unsplash.com/photo-1528113517408-5ccb1ae8c62c?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bradish(es)?\b/i, image: 'https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bbean(s)?\b/i, image: 'https://images.unsplash.com/photo-1550596334-7bb40a719f14?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bmint(s)?\b/i, image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bbasil(s)?\b/i, image: 'https://images.unsplash.com/photo-1603036830722-e2bcfbb2d358?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bokra(s)?\b/i, image: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bladyfinger(s)?\b/i, image: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcoriander\b/i, image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcilantro\b/i, image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bzucchini(s)?\b/i, image: 'https://images.unsplash.com/photo-1557844352-761f2565b576?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcourgette(s)?\b/i, image: 'https://images.unsplash.com/photo-1557844352-761f2565b576?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\basparagus\b/i, image: 'https://images.unsplash.com/photo-1515471209610-dae1c92d814e?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bcoconut(s)?\b/i, image: 'https://images.unsplash.com/photo-1543218024-57a70143c369?auto=format&fit=crop&q=80&w=600' },
  { pattern: /\bkiwi(s)?\b/i, image: 'https://images.unsplash.com/photo-1585059895524-72359e061381?auto=format&fit=crop&q=80&w=600' }
];

const CATEGORY_IMAGES = {
  Vegetable: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=600',
  Fruit: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=600',
  Grain: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
  Other: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'
};

const resolveProduceImage = (name, category) => {
  if (!name) return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Other;
  
  for (const rule of PRODUCE_RULES) {
    if (rule.pattern.test(name)) {
      return rule.image;
    }
  }
  
  return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Other;
};

const resolveProduceCategory = (name) => {
  if (!name) return 'Other';
  const cleanName = name.toLowerCase().trim();
  
  const fruits = [
    'apple', 'banana', 'orange', 'mango', 'strawberry', 'grapes', 'grape', 
    'pineapple', 'lemon', 'lime', 'watermelon', 'avocado', 'papaya', 'peach', 
    'cherry', 'berry', 'blueberry', 'raspberry', 'blackberry', 'pear', 'plum', 
    'guava', 'pomegranate', 'kiwi', 'melon', 'apricot', 'fig', 'date', 'coconut'
  ];
  
  const vegetables = [
    'potato', 'tomato', 'onion', 'carrot', 'garlic', 'spinach', 'broccoli', 
    'cucumber', 'pepper', 'chili', 'chillies', 'chilli', 'lettuce', 'cabbage', 'mushroom', 
    'corn', 'pumpkin', 'eggplant', 'brinjal', 'cauliflower', 'ginger', 'pea', 'peas', 
    'beet', 'radish', 'bean', 'beans', 'mint', 'basil', 'okra', 'ladyfinger', 'coriander', 
    'cilantro', 'zucchini', 'courgette', 'asparagus', 'celery', 'kale', 'leek', 'turnip'
  ];
  
  const grains = [
    'wheat', 'rice', 'barley', 'grain', 'oats', 'oat', 'rye', 'millet', 'quinoa'
  ];

  for (const fruit of fruits) {
    const regex = new RegExp('\\b' + fruit + 's?\\b', 'i');
    if (regex.test(cleanName)) return 'Fruit';
  }
  
  for (const veg of vegetables) {
    const regex = new RegExp('\\b' + veg + 's?\\b', 'i');
    if (regex.test(cleanName)) return 'Vegetable';
  }
  
  for (const grain of grains) {
    const regex = new RegExp('\\b' + grain + 's?\\b', 'i');
    if (regex.test(cleanName)) return 'Grain';
  }
  
  return 'Other';
};

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
  resolveCategory: resolveProduceCategory,
  resolveImage: resolveProduceImage,
  find: async (query) => {
    if (getConnected()) {
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
    if (!data.category) {
      data.category = resolveProduceCategory(data.name);
    }
    if (!data.imageUrl) {
      data.imageUrl = resolveProduceImage(data.name, data.category);
    }
    if (getConnected()) {
      return MongoProduct.create(data);
    }
    return JsonProduct.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (update.name || update.category || update.imageUrl !== undefined) {
      if (update.name && !update.category) {
        update.category = resolveProduceCategory(update.name);
      }
      if (!update.imageUrl) {
        update.imageUrl = resolveProduceImage(update.name || '', update.category || 'Other');
      }
    }
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

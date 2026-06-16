const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;

function setConnected(status) {
  isConnected = status;
}

function getConnected() {
  return isConnected;
}

// Local JSON-based storage setup
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class JSONModel {
  constructor(filename) {
    this.filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`Error reading database file ${this.filePath}:`, err);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(`Error writing database file ${this.filePath}:`, err);
    }
  }

  async find(query = {}) {
    let items = this.read();
    
    // Sort items descending by creation date so new items show first
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Basic filtering support
    return items.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined) {
          // Support text search query (e.g. { name: /apples/i })
          if (query[key] instanceof RegExp) {
            if (!query[key].test(item[key])) return false;
          } else if (item[key] !== query[key]) {
            return false;
          }
        }
      }
      return true;
    });
  }

  async findById(id) {
    const items = this.read();
    return items.find(item => item._id === id || item.id === id) || null;
  }

  async create(data) {
    const items = this.read();
    const newItem = {
      _id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      ...data,
      createdAt: new Date().toISOString()
    };
    items.push(newItem);
    this.write(items);
    return newItem;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const items = this.read();
    const idx = items.findIndex(item => item._id === id || item.id === id);
    if (idx === -1) return null;
    
    let updatedItem = { ...items[idx] };
    
    // Support MongoDB style updates: $inc or standard overwrite properties
    if (update.$inc) {
      for (let key in update.$inc) {
        updatedItem[key] = (updatedItem[key] || 0) + update.$inc[key];
      }
    } else {
      updatedItem = { ...updatedItem, ...update };
    }
    
    items[idx] = updatedItem;
    this.write(items);
    return updatedItem;
  }

  async findByIdAndDelete(id) {
    const items = this.read();
    const idx = items.findIndex(item => item._id === id || item.id === id);
    if (idx === -1) return null;
    const deleted = items.splice(idx, 1)[0];
    this.write(items);
    return deleted;
  }
}

module.exports = {
  setConnected,
  getConnected,
  JSONModel
};

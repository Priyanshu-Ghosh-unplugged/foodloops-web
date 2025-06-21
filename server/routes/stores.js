const express = require('express');
const Store = require('../models/Store');
const Product = require('../models/Product');
const router = express.Router();

// GET /api/stores - Get all stores
router.get('/', async (req, res) => {
  try {
    const { seller_id, verified } = req.query;
    
    let query = {};
    
    if (seller_id) {
      query.seller_id = seller_id;
    }
    
    if (verified !== undefined) {
      query.is_verified = verified === 'true';
    }

    const stores = await Store.find(query).sort({ created_at: -1 });
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// GET /api/stores/:id - Get single store
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// POST /api/stores - Create new store
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      phone,
      email,
      seller_id,
      seller_name
    } = req.body;

    // Validate required fields
    if (!name || !address || !seller_id || !seller_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const store = new Store({
      name,
      description,
      address,
      phone,
      email,
      seller_id,
      seller_name
    });

    await store.save();
    res.status(201).json(store);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

// PUT /api/stores/:id - Update store
router.put('/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Update fields
    const updateFields = ['name', 'description', 'address', 'phone', 'email', 'is_verified'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        store[field] = req.body[field];
      }
    });

    await store.save();
    res.json(store);
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
});

// DELETE /api/stores/:id - Delete store
router.delete('/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if store has products
    const productCount = await Product.countDocuments({ seller_id: store.seller_id });
    if (productCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete store with active products',
        productCount 
      });
    }

    await Store.findByIdAndDelete(req.params.id);
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ error: 'Failed to delete store' });
  }
});

// GET /api/stores/seller/:seller_id - Get stores by seller
router.get('/seller/:seller_id', async (req, res) => {
  try {
    const stores = await Store.find({ 
      seller_id: req.params.seller_id 
    }).sort({ created_at: -1 });
    
    res.json(stores);
  } catch (error) {
    console.error('Error fetching seller stores:', error);
    res.status(500).json({ error: 'Failed to fetch seller stores' });
  }
});

// GET /api/stores/:id/products - Get products for a specific store
router.get('/:id/products', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const products = await Product.find({ 
      seller_id: store.seller_id,
      status: 'active',
      expiry_date: { $gt: new Date() },
      quantity_available: { $gt: 0 }
    }).sort({ created_at: -1 });

    res.json(products);
  } catch (error) {
    console.error('Error fetching store products:', error);
    res.status(500).json({ error: 'Failed to fetch store products' });
  }
});

// GET /api/stores/stats/global - Get global store statistics
router.get('/stats/global', async (req, res) => {
  try {
    const stats = await Store.aggregate([
      {
        $group: {
          _id: null,
          totalStores: { $sum: 1 },
          verifiedStores: {
            $sum: { $cond: ['$is_verified', 1, 0] }
          }
        }
      }
    ]);

    const sellerStats = await Store.aggregate([
      {
        $group: {
          _id: '$seller_id',
          storeCount: { $sum: 1 },
          sellerName: { $first: '$seller_name' }
        }
      },
      {
        $sort: { storeCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      global: stats[0] || { totalStores: 0, verifiedStores: 0 },
      topSellers: sellerStats
    });
  } catch (error) {
    console.error('Error fetching store stats:', error);
    res.status(500).json({ error: 'Failed to fetch store statistics' });
  }
});

module.exports = router; 
const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

/**
 * Calculates the new price of a product based on an exponential decay function.
 * @param {number} original_price - The starting price of the product.
 * @param {Date} created_at - The date the product was listed.
 * @param {Date} expiry_date - The date the product will expire.
 * @param {number} [decay_rate=0.5] - A factor to control how quickly the price decreases.
 * @returns {number} The new, calculated price.
 */
const calculateDecayedPrice = (
  original_price,
  created_at,
  expiry_date,
  decay_rate = 0.5
) => {
  const now = new Date();
  // Ensure dates are valid Date objects
  const createdDate = new Date(created_at);
  const expiryDate = new Date(expiry_date);

  const total_lifespan = expiryDate.getTime() - createdDate.getTime();
  const elapsed_time = now.getTime() - createdDate.getTime();

  // If expired or invalid lifespan, return a minimal price
  if (total_lifespan <= 0 || elapsed_time >= total_lifespan) {
    return 0.01; 
  }

  const time_ratio = elapsed_time / total_lifespan;
  
  // Using exponential decay: price = original * e^(-decayRate * timeRatio)
  const new_price = original_price * Math.exp(-decay_rate * time_ratio);
  
  // Ensure price is not negative and has two decimal places
  return Math.max(0.01, parseFloat(new_price.toFixed(2)));
};

// GET /api/products - Get all active products with filtering
router.get('/', async (req, res) => {
  try {
    const {
      category,
      seller_id,
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit = 50,
      page = 1,
      search
    } = req.query;

    // Build query
    let query = { 
      status: 'active', 
      expiry_date: { $gt: new Date() },
      quantity_available: { $gt: 0 }
    };

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Add seller filter
    if (seller_id) {
      query.seller_id = seller_id;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { store_name: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Dynamically calculate the current price for each product
    const productsWithDynamicPrice = products.map(product => {
      const new_price = calculateDecayedPrice(
        product.original_price,
        product.created_at,
        product.expiry_date
      );
      return { ...product, current_price: new_price };
    });

    res.json({
      products: productsWithDynamicPrice,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Recalculate price to ensure it's up-to-date
    const new_price = calculateDecayedPrice(
      product.original_price,
      product.created_at,
      product.expiry_date
    );

    // If the calculated price is different, update it in the database
    if (new_price !== product.current_price) {
      product.current_price = new_price;
      await product.save();
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      original_price,
      current_price,
      expiry_date,
      quantity_available,
      image_url,
      seller_id,
      seller_name,
      store_name,
      store_address,
      store_phone,
      store_email
    } = req.body;

    // Validate required fields
    if (!name || !category || !original_price || !current_price || !expiry_date || !quantity_available || !seller_id || !seller_name || !store_name || !store_address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = new Product({
      name,
      description,
      category,
      original_price: parseFloat(original_price),
      current_price: parseFloat(current_price),
      expiry_date: new Date(expiry_date),
      quantity_available: parseInt(quantity_available),
      image_url,
      seller_id,
      seller_name,
      store_name,
      store_address,
      store_phone,
      store_email
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update fields
    const updateFields = ['name', 'description', 'category', 'original_price', 'current_price', 'expiry_date', 'quantity_available', 'image_url', 'status'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'original_price' || field === 'current_price') {
          product[field] = parseFloat(req.body[field]);
        } else if (field === 'quantity_available') {
          product[field] = parseInt(req.body[field]);
        } else if (field === 'expiry_date') {
          product[field] = new Date(req.body[field]);
        } else {
          product[field] = req.body[field];
        }
      }
    });

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET /api/products/seller/:seller_id - Get products by seller
router.get('/seller/:seller_id', async (req, res) => {
  try {
    const products = await Product.find({ 
      seller_id: req.params.seller_id 
    }).sort({ created_at: -1 });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ error: 'Failed to fetch seller products' });
  }
});

// GET /api/products/stats/global - Get global product statistics
router.get('/stats/global', async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $match: {
          status: 'active',
          expiry_date: { $gt: new Date() },
          quantity_available: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: '$current_price' },
          avgDiscount: { $avg: '$discount_percentage' },
          categories: { $addToSet: '$category' }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      {
        $match: {
          status: 'active',
          expiry_date: { $gt: new Date() },
          quantity_available: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$current_price' },
          avgDiscount: { $avg: '$discount_percentage' }
        }
      }
    ]);

    res.json({
      global: stats[0] || { totalProducts: 0, totalValue: 0, avgDiscount: 0, categories: [] },
      byCategory: categoryStats
    });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({ error: 'Failed to fetch product statistics' });
  }
});

module.exports = router; 
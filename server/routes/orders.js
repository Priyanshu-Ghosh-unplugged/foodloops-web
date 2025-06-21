const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const { authenticateUser, requireSeller } = require('../middleware/auth');
const router = express.Router();

// POST /api/orders - Create new order
router.post('/', authenticateUser, async (req, res) => {
  try {
    const {
      items,
      delivery_address,
      delivery_instructions,
      payment_method = 'wallet'
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Calculate total amount
    const total_amount = items.reduce((sum, item) => sum + item.total_price, 0);

    // Create order
    const order = new Order({
      user_id: req.user.civic_user_id,
      user_name: req.user.name,
      user_email: req.user.email,
      items,
      total_amount,
      delivery_address,
      delivery_instructions,
      payment_method
    });

    // Calculate eco impact
    await order.calculateEcoImpact();

    // Save order
    await order.save();

    // Update user stats
    await req.user.updateStats({
      total_spent: total_amount,
      items_count: items.reduce((sum, item) => sum + item.quantity, 0),
      co2_saved: order.eco_impact.co2_saved_kg,
      water_saved: order.eco_impact.water_saved_liters
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders - Get all orders (with filters)
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      payment_status,
      start_date,
      end_date 
    } = req.query;

    const filter = {};

    // Apply filters based on user type
    if (req.user.user_type === 'seller') {
      filter['items.seller_id'] = req.user.civic_user_id;
    } else {
      filter.user_id = req.user.civic_user_id;
    }

    if (status) filter.status = status;
    if (payment_status) filter.payment_status = payment_status;
    
    if (start_date || end_date) {
      filter.created_at = {};
      if (start_date) filter.created_at.$gte = new Date(start_date);
      if (end_date) filter.created_at.$lte = new Date(end_date);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(filter)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:orderId - Get specific order
router.get('/:orderId', authenticateUser, async (req, res) => {
  try {
    const filter = { order_id: req.params.orderId };

    // Apply access control
    if (req.user.user_type === 'seller') {
      filter['items.seller_id'] = req.user.civic_user_id;
    } else {
      filter.user_id = req.user.civic_user_id;
    }

    const order = await Order.findOne(filter);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PUT /api/orders/:orderId/status - Update order status (seller only)
router.put('/:orderId/status', authenticateUser, requireSeller, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findOne({
      order_id: req.params.orderId,
      'items.seller_id': req.user.civic_user_id
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    
    // Set delivery date when status is delivered
    if (status === 'delivered') {
      order.actual_delivery = new Date();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// PUT /api/orders/:orderId/payment - Update payment status
router.put('/:orderId/payment', authenticateUser, async (req, res) => {
  try {
    const { payment_status } = req.body;
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (!validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const filter = { order_id: req.params.orderId };

    // Apply access control
    if (req.user.user_type === 'seller') {
      filter['items.seller_id'] = req.user.civic_user_id;
    } else {
      filter.user_id = req.user.civic_user_id;
    }

    const order = await Order.findOne(filter);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.payment_status = payment_status;
    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// GET /api/orders/stats/summary - Get order statistics
router.get('/stats/summary', authenticateUser, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const filter = {};

    // Apply date filter
    if (start_date || end_date) {
      filter.created_at = {};
      if (start_date) filter.created_at.$gte = new Date(start_date);
      if (end_date) filter.created_at.$lte = new Date(end_date);
    }

    // Apply user type filter
    if (req.user.user_type === 'seller') {
      filter['items.seller_id'] = req.user.civic_user_id;
    } else {
      filter.user_id = req.user.civic_user_id;
    }

    const stats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total_amount' },
          totalItemsSaved: { $sum: '$eco_impact.items_saved' },
          totalCo2Saved: { $sum: '$eco_impact.co2_saved_kg' },
          totalWaterSaved: { $sum: '$eco_impact.water_saved_liters' },
          avgOrderValue: { $avg: '$total_amount' }
        }
      }
    ]);

    // Get status distribution
    const statusStats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find(filter)
      .sort({ created_at: -1 })
      .limit(5)
      .select('order_id total_amount status created_at');

    res.json({
      summary: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        totalItemsSaved: 0,
        totalCo2Saved: 0,
        totalWaterSaved: 0,
        avgOrderValue: 0
      },
      statusDistribution: statusStats,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
});

// DELETE /api/orders/:orderId - Cancel order (only pending orders)
router.delete('/:orderId', authenticateUser, async (req, res) => {
  try {
    const filter = { 
      order_id: req.params.orderId,
      status: 'pending'
    };

    // Apply access control
    if (req.user.user_type === 'seller') {
      filter['items.seller_id'] = req.user.civic_user_id;
    } else {
      filter.user_id = req.user.civic_user_id;
    }

    const order = await Order.findOne(filter);
    if (!order) {
      return res.status(404).json({ error: 'Order not found or cannot be cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

module.exports = router; 
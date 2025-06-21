const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const { authenticateUser, verifyOwnership } = require('../middleware/auth');
const router = express.Router();

// GET /api/users/profile - Get current user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const {
      name,
      avatar_url,
      wallet_address,
      preferences
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (avatar_url) user.avatar_url = avatar_url;
    if (wallet_address) user.wallet_address = wallet_address;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// POST /api/users/become-seller - Convert user to seller
router.post('/become-seller', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.user_type === 'seller') {
      return res.status(400).json({ error: 'User is already a seller' });
    }

    user.user_type = 'seller';
    await user.save();

    res.json({ 
      message: 'Successfully converted to seller',
      user_type: user.user_type 
    });
  } catch (error) {
    console.error('Error converting to seller:', error);
    res.status(500).json({ error: 'Failed to convert to seller' });
  }
});

// GET /api/users/orders - Get user orders
router.get('/orders', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const orders = await Order.getUserOrders(req.user.civic_user_id, parseInt(limit), parseInt(page));
    
    const total = await Order.countDocuments({ user_id: req.user.civic_user_id });
    
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
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// GET /api/users/orders/:orderId - Get specific order
router.get('/orders/:orderId', authenticateUser, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      order_id: req.params.orderId,
      user_id: req.user.civic_user_id 
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET /api/users/stats - Get user statistics
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent orders for additional stats
    const recentOrders = await Order.find({ 
      user_id: req.user.civic_user_id 
    })
    .sort({ created_at: -1 })
    .limit(5);

    const stats = {
      ...user.stats,
      recent_orders: recentOrders.length,
      member_since: user.created_at,
      last_order: user.stats.last_order_date
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// GET /api/users/preferences - Get user preferences
router.get('/preferences', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.preferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Failed to fetch user preferences' });
  }
});

// PUT /api/users/preferences - Update user preferences
router.put('/preferences', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const {
      preferred_categories,
      max_distance_km,
      max_price,
      notification_enabled,
      email_notifications,
      push_notifications
    } = req.body;

    // Update preferences
    if (preferred_categories !== undefined) {
      user.preferences.preferred_categories = preferred_categories;
    }
    if (max_distance_km !== undefined) {
      user.preferences.max_distance_km = max_distance_km;
    }
    if (max_price !== undefined) {
      user.preferences.max_price = max_price;
    }
    if (notification_enabled !== undefined) {
      user.preferences.notification_enabled = notification_enabled;
    }
    if (email_notifications !== undefined) {
      user.preferences.email_notifications = email_notifications;
    }
    if (push_notifications !== undefined) {
      user.preferences.push_notifications = push_notifications;
    }

    await user.save();
    res.json(user.preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
  }
});

// GET /api/users/:userId - Get user by ID (admin only or own profile)
router.get('/:userId', authenticateUser, verifyOwnership('userId'), async (req, res) => {
  try {
    const user = await User.findOne({ civic_user_id: req.params.userId }).select('-__v');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/users/stats/global - Get global user statistics (admin only)
router.get('/stats/global', authenticateUser, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalBuyers: {
            $sum: { $cond: [{ $eq: ['$user_type', 'buyer'] }, 1, 0] }
          },
          totalSellers: {
            $sum: { $cond: [{ $eq: ['$user_type', 'seller'] }, 1, 0] }
          },
          totalAdmins: {
            $sum: { $cond: [{ $eq: ['$user_type', 'admin'] }, 1, 0] }
          },
          verifiedUsers: {
            $sum: { $cond: ['$is_verified', 1, 0] }
          },
          totalItemsSaved: { $sum: '$stats.items_saved' },
          totalCo2Saved: { $sum: '$stats.co2_saved_kg' },
          totalWaterSaved: { $sum: '$stats.water_saved_liters' },
          totalSpent: { $sum: '$stats.total_spent' }
        }
      }
    ]);

    const recentUsers = await User.find()
      .sort({ created_at: -1 })
      .limit(10)
      .select('name email user_type created_at');

    const topUsers = await User.find()
      .sort({ 'stats.items_saved': -1 })
      .limit(10)
      .select('name email stats.items_saved stats.co2_saved_kg');

    res.json({
      global: stats[0] || {
        totalUsers: 0,
        totalBuyers: 0,
        totalSellers: 0,
        totalAdmins: 0,
        verifiedUsers: 0,
        totalItemsSaved: 0,
        totalCo2Saved: 0,
        totalWaterSaved: 0,
        totalSpent: 0
      },
      recentUsers,
      topUsers
    });
  } catch (error) {
    console.error('Error fetching global user stats:', error);
    res.status(500).json({ error: 'Failed to fetch global user statistics' });
  }
});

module.exports = router; 
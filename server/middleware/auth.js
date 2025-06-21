const User = require('../models/User');

// Middleware to authenticate user via Civic Auth
const authenticateUser = async (req, res, next) => {
  try {
    // Get user info from Civic Auth (this would come from the frontend)
    const { civic_user_id, email, name, avatar_url } = req.headers;

    if (!civic_user_id || !email || !name) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Missing user credentials' 
      });
    }

    // Find or create user in MongoDB
    const user = await User.findOrCreateByCivicId({
      civic_user_id,
      email,
      name,
      avatar_url
    });

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error' 
    });
  }
};

// Middleware to check if user is a seller
const requireSeller = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    if (req.user.user_type !== 'seller' && req.user.user_type !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Seller privileges required' 
      });
    }

    next();
  } catch (error) {
    console.error('Seller authorization error:', error);
    res.status(500).json({ 
      error: 'Authorization failed',
      message: 'Internal server error' 
    });
  }
};

// Middleware to check if user is an admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Admin privileges required' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({ 
      error: 'Authorization failed',
      message: 'Internal server error' 
    });
  }
};

// Middleware to verify user owns the resource
const verifyOwnership = (resourceField = 'user_id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required' 
        });
      }

      const resourceUserId = req.params[resourceField] || req.body[resourceField];
      
      if (resourceUserId && resourceUserId !== req.user.civic_user_id) {
        // Allow admins to access any resource
        if (req.user.user_type !== 'admin') {
          return res.status(403).json({ 
            error: 'Access denied',
            message: 'You can only access your own resources' 
          });
        }
      }

      next();
    } catch (error) {
      console.error('Ownership verification error:', error);
      res.status(500).json({ 
        error: 'Authorization failed',
        message: 'Internal server error' 
      });
    }
  };
};

module.exports = {
  authenticateUser,
  requireSeller,
  requireAdmin,
  verifyOwnership
}; 
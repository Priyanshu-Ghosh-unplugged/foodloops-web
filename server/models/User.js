const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  civic_user_id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  avatar_url: {
    type: String,
    trim: true
  },
  wallet_address: {
    type: String,
    trim: true
  },
  user_type: {
    type: String,
    required: true,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  preferences: {
    preferred_categories: [{
      type: String,
      enum: ['dairy', 'bakery', 'meat', 'produce', 'pantry', 'frozen', 'beverages', 'other']
    }],
    max_distance_km: {
      type: Number,
      default: 10,
      min: 1,
      max: 100
    },
    max_price: {
      type: Number,
      default: 1000,
      min: 0
    },
    notification_enabled: {
      type: Boolean,
      default: true
    },
    email_notifications: {
      type: Boolean,
      default: true
    },
    push_notifications: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    total_orders: {
      type: Number,
      default: 0,
      min: 0
    },
    total_spent: {
      type: Number,
      default: 0,
      min: 0
    },
    items_saved: {
      type: Number,
      default: 0,
      min: 0
    },
    co2_saved_kg: {
      type: Number,
      default: 0,
      min: 0
    },
    water_saved_liters: {
      type: Number,
      default: 0,
      min: 0
    },
    last_order_date: {
      type: Date
    }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for efficient queries
UserSchema.index({ user_type: 1 });
UserSchema.index({ is_verified: 1 });

// Method to update user stats
UserSchema.methods.updateStats = function(orderData) {
  this.stats.total_orders += 1;
  this.stats.total_spent += orderData.total_spent;
  this.stats.items_saved += orderData.items_count;
  this.stats.co2_saved_kg += orderData.co2_saved;
  this.stats.water_saved_liters += orderData.water_saved;
  this.stats.last_order_date = new Date();
  return this.save();
};

// Static method to find or create user
UserSchema.statics.findOrCreateByCivicId = async function(civicUserData) {
  let user = await this.findOne({ civic_user_id: civicUserData.civic_user_id });
  
  if (!user) {
    user = new this({
      civic_user_id: civicUserData.civic_user_id,
      email: civicUserData.email,
      name: civicUserData.name,
      avatar_url: civicUserData.avatar_url,
      last_login: new Date()
    });
    await user.save();
  } else {
    // Update last login
    user.last_login = new Date();
    await user.save();
  }
  
  return user;
};

module.exports = mongoose.model('User', UserSchema); 
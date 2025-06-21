const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
  order_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true
  },
  user_name: {
    type: String,
    required: true,
    trim: true
  },
  user_email: {
    type: String,
    required: true,
    trim: true
  },
  items: [{
    product_id: {
      type: String,
      required: true
    },
    product_name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0
    },
    total_price: {
      type: Number,
      required: true,
      min: 0
    },
    seller_id: {
      type: String,
      required: true
    },
    seller_name: {
      type: String,
      required: true
    },
    store_name: {
      type: String,
      required: true
    }
  }],
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment_status: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    required: true,
    enum: ['wallet', 'card', 'upi', 'cash'],
    default: 'wallet'
  },
  delivery_address: {
    type: String,
    trim: true
  },
  delivery_instructions: {
    type: String,
    trim: true
  },
  estimated_delivery: {
    type: Date
  },
  actual_delivery: {
    type: Date
  },
  eco_impact: {
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
    }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for efficient queries
OrderSchema.index({ user_id: 1, created_at: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ payment_status: 1 });

// Pre-save middleware to generate order ID
OrderSchema.pre('save', function(next) {
  if (this.isNew && !this.order_id) {
    this.order_id = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

// Method to calculate eco impact
OrderSchema.methods.calculateEcoImpact = function() {
  let itemsSaved = 0;
  let co2Saved = 0;
  let waterSaved = 0;

  this.items.forEach(item => {
    itemsSaved += item.quantity;
    // Rough estimates for eco impact
    co2Saved += item.quantity * 0.2; // 0.2 kg CO2 per item
    waterSaved += item.quantity * 40; // 40 liters per item
  });

  this.eco_impact = {
    items_saved: itemsSaved,
    co2_saved_kg: co2Saved,
    water_saved_liters: waterSaved
  };

  return this.save();
};

// Static method to get user orders
OrderSchema.statics.getUserOrders = function(userId, limit = 10, page = 1) {
  const skip = (page - 1) * limit;
  return this.find({ user_id: userId })
    .sort({ created_at: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get seller orders
OrderSchema.statics.getSellerOrders = function(sellerId, limit = 10, page = 1) {
  const skip = (page - 1) * limit;
  return this.find({ 'items.seller_id': sellerId })
    .sort({ created_at: -1 })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('Order', OrderSchema); 
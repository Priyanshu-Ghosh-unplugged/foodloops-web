import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  civic_user_id: string;
  email: string;
  name: string;
  avatar_url?: string;
  wallet_address?: string;
  user_type: 'buyer' | 'seller' | 'admin';
  is_verified: boolean;
  preferences: {
    preferred_categories: string[];
    max_distance_km: number;
    max_price: number;
    notification_enabled: boolean;
    email_notifications: boolean;
    push_notifications: boolean;
  };
  stats: {
    total_orders: number;
    total_spent: number;
    items_saved: number;
    co2_saved_kg: number;
    water_saved_liters: number;
    last_order_date?: Date;
  };
  created_at: Date;
  updated_at: Date;
  last_login: Date;
}

const UserSchema: Schema = new Schema({
  civic_user_id: {
    type: String,
    required: true,
    unique: true,
    index: true
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
UserSchema.index({ civic_user_id: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ user_type: 1 });
UserSchema.index({ is_verified: 1 });

// Method to update user stats
UserSchema.methods.updateStats = function(orderData: {
  total_spent: number;
  items_count: number;
  co2_saved: number;
  water_saved: number;
}) {
  this.stats.total_orders += 1;
  this.stats.total_spent += orderData.total_spent;
  this.stats.items_saved += orderData.items_count;
  this.stats.co2_saved_kg += orderData.co2_saved;
  this.stats.water_saved_liters += orderData.water_saved;
  this.stats.last_order_date = new Date();
  return this.save();
};

// Static method to find or create user
UserSchema.statics.findOrCreateByCivicId = async function(civicUserData: {
  civic_user_id: string;
  email: string;
  name: string;
  avatar_url?: string;
}) {
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

export default mongoose.model<IUser>('User', UserSchema); 
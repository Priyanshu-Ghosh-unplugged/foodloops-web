import mongoose, { Schema, Document } from 'mongoose';

export interface IStore extends Document {
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  seller_id: string;
  seller_name: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

const StoreSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  seller_id: {
    type: String,
    required: true,
    index: true
  },
  seller_name: {
    type: String,
    required: true,
    trim: true
  },
  is_verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for efficient queries
StoreSchema.index({ seller_id: 1 });
StoreSchema.index({ is_verified: 1 });

export default mongoose.model<IStore>('Store', StoreSchema); 
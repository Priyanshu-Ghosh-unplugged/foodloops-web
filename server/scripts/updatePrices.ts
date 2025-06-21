import mongoose from 'mongoose';
import Product from '../models/Product';
import { connectDB } from '../config/database';

/**
 * Calculates the new price of a product based on a decay function.
 * 
 * @param original_price The starting price of the product.
 * @param created_at The date the product was listed.
 * @param expiry_date The date the product will expire.
 * @param decay_rate A factor to control how quickly the price decreases.
 * @returns The new, calculated price.
 */
const calculateDecayedPrice = (
  original_price: number,
  created_at: Date,
  expiry_date: Date,
  decay_rate: number = 0.5
): number => {
  const now = new Date();
  const total_lifespan = expiry_date.getTime() - created_at.getTime();
  const elapsed_time = now.getTime() - created_at.getTime();

  if (total_lifespan <= 0 || elapsed_time >= total_lifespan) {
    // Return a minimal price if expired or lifespan is invalid
    return 0.01;
  }

  const time_ratio = elapsed_time / total_lifespan;
  
  // Exponential decay function
  const new_price = original_price * Math.exp(-decay_rate * time_ratio);
  
  return Math.max(0.01, parseFloat(new_price.toFixed(2)));
};

/**
 * Updates the prices of all active products in the database.
 */
const updateAllProductPrices = async () => {
  console.log('Starting price update job...');
  
  try {
    await connectDB();
    
    const products = await Product.findActive();
    
    if (products.length === 0) {
      console.log('No active products to update.');
      return;
    }

    for (const product of products) {
      const new_price = calculateDecayedPrice(
        product.original_price,
        product.created_at,
        product.expiry_date
      );
      
      if (new_price !== product.current_price) {
        product.current_price = new_price;
        await product.save();
        console.log(`Updated price for ${product.name} to ${new_price}`);
      }
    }

    console.log('Price update job finished successfully.');
  } catch (error) {
    console.error('Error updating product prices:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Execute the job
updateAllProductPrices(); 
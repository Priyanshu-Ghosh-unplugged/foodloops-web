const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Store = require('../models/Store');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodloops';

const sampleStores = [
  {
    name: "Priyan's Fresh Finds",
    description: 'Your local source for fresh, discounted groceries and produce!',
    address: '123 Green Way, Bangalore, Karnataka 560001',
    phone: '+91 98765 43210',
    email: 'contact@freshfinds.com',
    seller_id: 'seller_001',
    seller_name: 'Priyan Kumar',
    is_verified: true
  },
  {
    name: "Community Co-op Market",
    description: 'Community-owned cooperative providing quality food at fair prices.',
    address: '456 Market Street, Mumbai, Maharashtra 400001',
    phone: '+91 98765 43211',
    email: 'info@communitycoop.com',
    seller_id: 'seller_002',
    seller_name: 'Anita Patel',
    is_verified: true
  },
  {
    name: "Eco-Friendly Grocers",
    description: 'Sustainable and organic products with a focus on reducing food waste.',
    address: '789 Eco Lane, Delhi, Delhi 110001',
    phone: '+91 98765 43212',
    email: 'hello@ecogrocers.com',
    seller_id: 'seller_003',
    seller_name: 'Rajesh Singh',
    is_verified: false
  },
  {
    name: "Local Farmers Market",
    description: 'Direct from farm to table - fresh produce from local farmers.',
    address: '321 Farm Road, Chennai, Tamil Nadu 600001',
    phone: '+91 98765 43213',
    email: 'farmers@localmarket.com',
    seller_id: 'seller_004',
    seller_name: 'Lakshmi Devi',
    is_verified: true
  }
];

const sampleProducts = [
  // Dairy Products
  {
    name: 'Organic Whole Milk',
    description: 'Fresh organic whole milk, perfect for your morning coffee or cereal.',
    category: 'dairy',
    original_price: 120,
    current_price: 60,
    expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    quantity_available: 15,
    image_url: '/placeholder.svg',
    seller_id: 'seller_001',
    seller_name: 'Priyan Kumar',
    store_name: "Priyan's Fresh Finds",
    store_address: '123 Green Way, Bangalore, Karnataka 560001'
  },
  {
    name: 'Greek Yogurt (500g)',
    description: 'Creamy Greek yogurt with live cultures, great for smoothies or as a snack.',
    category: 'dairy',
    original_price: 180,
    current_price: 90,
    expiry_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    quantity_available: 8,
    image_url: '/placeholder.svg',
    seller_id: 'seller_001',
    seller_name: 'Priyan Kumar',
    store_name: "Priyan's Fresh Finds",
    store_address: '123 Green Way, Bangalore, Karnataka 560001'
  },
  
  // Bakery Products
  {
    name: 'Sourdough Bread',
    description: 'Artisan sourdough bread made with traditional methods.',
    category: 'bakery',
    original_price: 80,
    current_price: 40,
    expiry_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    quantity_available: 12,
    image_url: '/placeholder.svg',
    seller_id: 'seller_002',
    seller_name: 'Anita Patel',
    store_name: 'Community Co-op Market',
    store_address: '456 Market Street, Mumbai, Maharashtra 400001'
  },
  {
    name: 'Croissants (Pack of 4)',
    description: 'Buttery, flaky croissants perfect for breakfast or brunch.',
    category: 'bakery',
    original_price: 160,
    current_price: 80,
    expiry_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    quantity_available: 6,
    image_url: '/placeholder.svg',
    seller_id: 'seller_002',
    seller_name: 'Anita Patel',
    store_name: 'Community Co-op Market',
    store_address: '456 Market Street, Mumbai, Maharashtra 400001'
  },
  
  // Produce
  {
    name: 'Avocados (Bag of 4)',
    description: 'Ripe and ready to eat avocados, perfect for guacamole or toast.',
    category: 'produce',
    original_price: 200,
    current_price: 100,
    expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    quantity_available: 20,
    image_url: '/placeholder.svg',
    seller_id: 'seller_003',
    seller_name: 'Rajesh Singh',
    store_name: 'Eco-Friendly Grocers',
    store_address: '789 Eco Lane, Delhi, Delhi 110001'
  },
  {
    name: 'Organic Tomatoes (1kg)',
    description: 'Fresh organic tomatoes, perfect for salads or cooking.',
    category: 'produce',
    original_price: 120,
    current_price: 60,
    expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    quantity_available: 25,
    image_url: '/placeholder.svg',
    seller_id: 'seller_004',
    seller_name: 'Lakshmi Devi',
    store_name: 'Local Farmers Market',
    store_address: '321 Farm Road, Chennai, Tamil Nadu 600001'
  },
  
  // Pantry Items
  {
    name: 'Quinoa (500g)',
    description: 'Organic quinoa, a complete protein source for healthy meals.',
    category: 'pantry',
    original_price: 300,
    current_price: 150,
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    quantity_available: 10,
    image_url: '/placeholder.svg',
    seller_id: 'seller_003',
    seller_name: 'Rajesh Singh',
    store_name: 'Eco-Friendly Grocers',
    store_address: '789 Eco Lane, Delhi, Delhi 110001'
  },
  
  // Frozen Items
  {
    name: 'Mixed Berries (500g)',
    description: 'Frozen mixed berries - strawberries, blueberries, and raspberries.',
    category: 'frozen',
    original_price: 250,
    current_price: 125,
    expiry_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    quantity_available: 15,
    image_url: '/placeholder.svg',
    seller_id: 'seller_001',
    seller_name: 'Priyan Kumar',
    store_name: "Priyan's Fresh Finds",
    store_address: '123 Green Way, Bangalore, Karnataka 560001'
  },
  
  // Beverages
  {
    name: 'Fresh Orange Juice (1L)',
    description: 'Freshly squeezed orange juice, no preservatives added.',
    category: 'beverages',
    original_price: 150,
    current_price: 75,
    expiry_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    quantity_available: 8,
    image_url: '/placeholder.svg',
    seller_id: 'seller_002',
    seller_name: 'Anita Patel',
    store_name: 'Community Co-op Market',
    store_address: '456 Market Street, Mumbai, Maharashtra 400001'
  },
  
  // Meat
  {
    name: 'Chicken Breast (500g)',
    description: 'Fresh chicken breast, perfect for healthy meals.',
    category: 'meat',
    original_price: 400,
    current_price: 200,
    expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    quantity_available: 5,
    image_url: '/placeholder.svg',
    seller_id: 'seller_001',
    seller_name: 'Priyan Kumar',
    store_name: "Priyan's Fresh Finds",
    store_address: '123 Green Way, Bangalore, Karnataka 560001'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Store.deleteMany({});
    console.log('Cleared existing data');

    // Insert stores
    const createdStores = await Store.insertMany(sampleStores);
    console.log(`Created ${createdStores.length} stores`);

    // Insert products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Created ${createdProducts.length} products`);

    console.log('Database seeded successfully!');
    
    // Display some statistics
    const totalProducts = await Product.countDocuments();
    const totalStores = await Store.countDocuments();
    const activeProducts = await Product.countDocuments({ 
      status: 'active', 
      expiry_date: { $gt: new Date() },
      quantity_available: { $gt: 0 }
    });

    console.log('\nDatabase Statistics:');
    console.log(`Total Stores: ${totalStores}`);
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Active Products: ${activeProducts}`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase(); 
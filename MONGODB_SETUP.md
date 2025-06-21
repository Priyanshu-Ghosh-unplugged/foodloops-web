# MongoDB Atlas Integration Setup Guide

This guide will help you set up MongoDB Atlas for the FoodLoops application to store products and stores data.

## 🚀 Quick Start

### 1. Install Dependencies

First, install the new dependencies:

```bash
npm install
```

### 2. Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Free tier is sufficient for development)

2. **Configure Database Access**
   - Go to Security → Database Access
   - Create a new database user with read/write permissions
   - Save the username and password

3. **Configure Network Access**
   - Go to Security → Network Access
   - Add your IP address or use `0.0.0.0/0` for development (allows all IPs)

4. **Get Connection String**
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/foodloops?retryWrites=true&w=majority

# API Configuration
VITE_API_URL=http://localhost:5000/api

# Other existing configurations...
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Start the Application

Run both the frontend and backend servers:

```bash
# Install dependencies (if not done already)
npm install

# Seed the database with sample data
npm run seed

# Start both frontend and backend
npm run dev:full
```

Or run them separately:

```bash
# Terminal 1 - Start backend server
npm run server

# Terminal 2 - Start frontend
npm run dev
```

## 📊 Database Schema

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: String, // 'dairy', 'bakery', 'meat', 'produce', 'pantry', 'frozen', 'beverages', 'other'
  original_price: Number,
  current_price: Number,
  discount_percentage: Number,
  expiry_date: Date,
  quantity_available: Number,
  status: String, // 'active', 'inactive', 'sold_out', 'expired'
  image_url: String,
  seller_id: String,
  seller_name: String,
  store_name: String,
  store_address: String,
  store_phone: String,
  store_email: String,
  created_at: Date,
  updated_at: Date
}
```

### Stores Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  address: String,
  phone: String,
  email: String,
  seller_id: String,
  seller_name: String,
  is_verified: Boolean,
  created_at: Date,
  updated_at: Date
}
```

## 🔧 API Endpoints

### Products
- `GET /api/products` - Get all products with filtering
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/seller/:seller_id` - Get products by seller
- `GET /api/products/stats/global` - Get product statistics

### Stores
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get single store
- `POST /api/stores` - Create new store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store
- `GET /api/stores/seller/:seller_id` - Get stores by seller
- `GET /api/stores/:id/products` - Get products for store
- `GET /api/stores/stats/global` - Get store statistics

## 🎯 Features

### Product Management
- ✅ Create, read, update, delete products
- ✅ Category-based filtering
- ✅ Search functionality
- ✅ Pagination
- ✅ Sorting by various criteria
- ✅ Automatic discount calculation
- ✅ Expiry date tracking

### Store Management
- ✅ Create and manage stores
- ✅ Store verification system
- ✅ Store-product relationships
- ✅ Seller-specific data

### Data Validation
- ✅ Input validation on both frontend and backend
- ✅ Required field checking
- ✅ Price validation (current price must be less than original)
- ✅ Date validation for expiry dates

### Performance
- ✅ Database indexing for efficient queries
- ✅ React Query for client-side caching
- ✅ Pagination for large datasets
- ✅ Optimized queries with filtering

## 🧪 Testing the Integration

1. **Check API Health**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **View Sample Data**
   - Visit `http://localhost:3000/products` to see products
   - Visit `http://localhost:3000/seller` to manage stores and products

3. **Test API Endpoints**
   ```bash
   # Get all products
   curl http://localhost:5000/api/products
   
   # Get products by category
   curl http://localhost:5000/api/products?category=dairy
   
   # Get stores
   curl http://localhost:5000/api/stores
   ```

## 🔒 Security Considerations

- Store MongoDB credentials securely in environment variables
- Use MongoDB Atlas IP whitelist for production
- Implement proper authentication for seller operations
- Validate all user inputs
- Use HTTPS in production

## 🚀 Deployment

### Backend Deployment
The backend can be deployed to:
- **Vercel** (serverless functions)
- **Railway**
- **Heroku**
- **DigitalOcean App Platform**

### Database Deployment
- Use MongoDB Atlas for production database
- Set up proper backup and monitoring
- Configure read replicas for high availability

## 📝 Troubleshooting

### Common Issues

1. **Connection Error**
   - Check MongoDB URI format
   - Verify network access settings
   - Ensure database user has correct permissions

2. **CORS Error**
   - Backend is configured to allow all origins in development
   - For production, configure specific origins

3. **Environment Variables**
   - Ensure `.env.local` file exists
   - Check variable names match exactly
   - Restart server after changing environment variables

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
```

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [React Query Documentation](https://tanstack.com/query/latest) 
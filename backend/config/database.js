const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/focusflow';
    
    const options = {
      // These options are recommended for MongoDB Atlas
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    await mongoose.connect(mongoURI, options);
    console.log('MongoDB connected successfully');
    console.log(`Connected to: ${mongoURI.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Please check your MONGODB_URI in .env file');
    process.exit(1);
  }
};

module.exports = connectDB;


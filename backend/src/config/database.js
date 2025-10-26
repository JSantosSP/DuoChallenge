const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    
    await createIndexes();
    
  } catch (error) {
    console.error(`❌ Error conectando a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const { User, Level } = require('../models');
    
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await Level.collection.createIndex({ gameSetId: 1, order: 1 });
    
    console.log('✅ Índices de base de datos creados');
  } catch (error) {
    console.log('⚠️ Error creando índices:', error.message);
  }
};

module.exports = connectDB;
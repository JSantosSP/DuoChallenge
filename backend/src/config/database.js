const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    
    // Crear índices si no existen
    await createIndexes();
    
  } catch (error) {
    console.error(`❌ Error conectando a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const { User, Challenge, Level } = require('../models');
    
    // Índices para optimizar queries
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await Challenge.collection.createIndex({ userId: 1, completed: 1 });
    await Level.collection.createIndex({ userId: 1, order: 1 });
    
    console.log('✅ Índices de base de datos creados');
  } catch (error) {
    console.log('⚠️ Error creando índices:', error.message);
  }
};

module.exports = connectDB;
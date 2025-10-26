/**
 * @fileoverview Configuración y conexión a la base de datos MongoDB
 * @description Gestiona la conexión a MongoDB y la creación de índices
 */

const mongoose = require('mongoose');
const config = require('./index');

/**
 * @function connectDB
 * @async
 * @description Establece la conexión a MongoDB y crea los índices necesarios
 * @throws {Error} Termina el proceso si no puede conectar a MongoDB
 * @returns {Promise<void>}
 */
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

/**
 * @function createIndexes
 * @async
 * @description Crea índices en la base de datos para optimizar consultas
 * @returns {Promise<void>}
 */
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

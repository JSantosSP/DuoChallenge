/**
 * @fileoverview Punto de entrada centralizado para todos los modelos
 * @description Exporta todos los modelos de Mongoose para facilitar su importación
 */

module.exports = {
  User: require('./User.model'),
  PrizeTemplate: require('./PrizeTemplate.model'),
  Prize: require('./Prize.model'),
  GameSet: require('./GameSet.model'),
  Variable: require('./Variable.model'),
  UserData: require('./UserData.model'),
  GameShare: require('./GameShare.model'),
  Category: require('./Category.model'),
  Level: require('./Level.model'),
};

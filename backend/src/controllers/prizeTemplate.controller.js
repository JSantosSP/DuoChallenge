/**
 * @fileoverview Controlador de Plantillas de Premio
 * @description Gestiona plantillas predefinidas de premios
 */

const { PrizeTemplate } = require('../models');

/**
 * @function getPrizeTemplates
 * @async
 * @description Obtiene todas las plantillas de premio disponibles
 * @returns {Object} 200 - Lista de plantillas
 * @returns {Object} 500 - Error del servidor
 */
const getPrizeTemplates = async (req, res) => {
  try {
      const templates = await PrizeTemplate.find()
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: { templates } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function getPrizeTemplateById
 * @async
 * @description Obtiene una plantilla específica por ID
 * @param {string} req.params.id - ID de la plantilla
 * @returns {Object} 200 - Plantilla encontrada
 * @returns {Object} 404 - Plantilla no encontrada
 * @returns {Object} 500 - Error del servidor
 */
const getPrizeTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await PrizeTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
    }
    
    res.json({ success: true, data: { template } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function createPrizeTemplate
 * @async
 * @description Crea una nueva plantilla de premio
 * @param {Object} req.body - Datos de la plantilla
 * @returns {Object} 201 - Plantilla creada
 * @returns {Object} 500 - Error del servidor
 */
const createPrizeTemplate = async (req, res) => {
  try {
    const template = new PrizeTemplate(req.body);
    await template.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Plantilla de premio creada exitosamente',
      data: { template } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function updatePrizeTemplate
 * @async
 * @description Actualiza una plantilla existente
 * @param {string} req.params.id - ID de la plantilla
 * @param {Object} req.body - Datos a actualizar
 * @returns {Object} 200 - Plantilla actualizada
 * @returns {Object} 404 - Plantilla no encontrada
 * @returns {Object} 500 - Error del servidor
 */
const updatePrizeTemplate = async (req, res) => {
  try {
    const { id } = req.params;    
    
    const template = await PrizeTemplate.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
    }
    
    res.json({ 
      success: true, 
      message: 'Plantilla de premio actualizada exitosamente',
      data: { template } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function deletePrizeTemplate
 * @async
 * @description Elimina una plantilla de premio
 * @param {string} req.params.id - ID de la plantilla
 * @returns {Object} 200 - Plantilla eliminada
 * @returns {Object} 404 - Plantilla no encontrada
 * @returns {Object} 500 - Error del servidor
 */
const deletePrizeTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await PrizeTemplate.findByIdAndDelete(id);
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
    }
    
    res.json({ 
      success: true, 
      message: 'Plantilla de premio eliminada exitosamente' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPrizeTemplates,
  getPrizeTemplateById,
  createPrizeTemplate,
  updatePrizeTemplate,
  deletePrizeTemplate
};

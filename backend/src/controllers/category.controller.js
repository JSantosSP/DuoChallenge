/**
 * @fileoverview Controlador de Categorías
 * @description Gestiona las categorías para clasificar los datos del usuario
 */

const { Category } = require('../models');

/**
 * @function getCategories
 * @async
 * @description Obtiene todas las categorías ordenadas alfabéticamente
 * @returns {Object} 200 - Lista de categorías
 * @returns {Object} 500 - Error del servidor
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function getCategoryById
 * @async
 * @description Obtiene una categoría específica por ID
 * @param {string} req.params.id - ID de la categoría
 * @returns {Object} 200 - Categoría encontrada
 * @returns {Object} 404 - Categoría no encontrada
 * @returns {Object} 500 - Error del servidor
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    
    res.json({ success: true, data: { category } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function createCategory
 * @async
 * @description Crea una nueva categoría
 * @param {Object} req.body - Datos de la categoría
 * @returns {Object} 201 - Categoría creada
 * @returns {Object} 400 - Ya existe una categoría con ese nombre
 * @returns {Object} 500 - Error del servidor
 */
const createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ 
      success: true, 
      message: 'Categoría creada exitosamente',
      data: { category } 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe una categoría con ese nombre' 
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function updateCategory
 * @async
 * @description Actualiza una categoría existente
 * @param {string} req.params.id - ID de la categoría
 * @param {Object} req.body - Datos a actualizar
 * @returns {Object} 200 - Categoría actualizada
 * @returns {Object} 400 - Ya existe otra categoría con ese nombre
 * @returns {Object} 404 - Categoría no encontrada
 * @returns {Object} 500 - Error del servidor
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    
    res.json({ 
      success: true, 
      message: 'Categoría actualizada exitosamente',
      data: { category } 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe una categoría con ese nombre' 
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function deleteCategory
 * @async
 * @description Elimina una categoría si no tiene plantillas asociadas
 * @param {string} req.params.id - ID de la categoría
 * @returns {Object} 200 - Categoría eliminada
 * @returns {Object} 400 - No se puede eliminar (tiene plantillas asociadas)
 * @returns {Object} 404 - Categoría no encontrada
 * @returns {Object} 500 - Error del servidor
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { LevelTemplate } = require('../models');
    const templatesCount = await LevelTemplate.countDocuments({ categoryId: id });
    
    if (templatesCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `No se puede eliminar. Hay ${templatesCount} plantilla(s) asociada(s) a esta categoría` 
      });
    }
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    
    res.json({ 
      success: true, 
      message: 'Categoría eliminada exitosamente' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

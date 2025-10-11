const { Category } = require('../models');

// Obtener todas las categorías
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener una categoría por ID
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

// Crear nueva categoría
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

// Actualizar categoría
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

// Eliminar categoría
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si hay plantillas asociadas
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

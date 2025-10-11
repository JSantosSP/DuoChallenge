const { LevelTemplate, Category } = require('../models');

// Obtener todas las plantillas de nivel
const getLevelTemplates = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = {};
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    
    const templates = await LevelTemplate.find(filter)
      .populate('categoryId', 'name description')
      .sort({ order: 1, createdAt: -1 });
      
    res.json({ success: true, data: { templates } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener una plantilla de nivel por ID
const getLevelTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await LevelTemplate.findById(id)
      .populate('categoryId', 'name description');
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
    }
    
    res.json({ success: true, data: { template } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Crear nueva plantilla de nivel
const createLevelTemplate = async (req, res) => {
  try {
    const { categoryId } = req.body;
    
    // Verificar que la categoría existe
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'La categoría especificada no existe' 
      });
    }
    
    const template = new LevelTemplate(req.body);
    await template.save();
    
    // Poblar la categoría antes de devolver
    await template.populate('categoryId', 'name description');
    
    res.status(201).json({ 
      success: true, 
      message: 'Plantilla de nivel creada exitosamente',
      data: { template } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Actualizar plantilla de nivel
const updateLevelTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId } = req.body;
    
    // Si se está actualizando la categoría, verificar que existe
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ 
          success: false, 
          message: 'La categoría especificada no existe' 
        });
      }
    }
    
    const template = await LevelTemplate.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('categoryId', 'name description');
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
    }
    
    res.json({ 
      success: true, 
      message: 'Plantilla de nivel actualizada exitosamente',
      data: { template } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Eliminar plantilla de nivel
const deleteLevelTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await LevelTemplate.findByIdAndDelete(id);
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
    }
    
    res.json({ 
      success: true, 
      message: 'Plantilla de nivel eliminada exitosamente' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener tipos de datos disponibles
const getDataTypes = async (req, res) => {
  try {
    const dataTypes = [
      { value: 'nombre', label: 'Nombre' },
      { value: 'foto', label: 'Foto' },
      { value: 'fecha', label: 'Fecha' },
      { value: 'lugar', label: 'Lugar' },
      { value: 'texto', label: 'Texto' },
      { value: 'numero', label: 'Número' },
      { value: 'telefono', label: 'Teléfono' },
      { value: 'email', label: 'Email' },
      { value: 'otro', label: 'Otro' }
    ];
    
    res.json({ success: true, data: { dataTypes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLevelTemplates,
  getLevelTemplateById,
  createLevelTemplate,
  updateLevelTemplate,
  deleteLevelTemplate,
  getDataTypes
};

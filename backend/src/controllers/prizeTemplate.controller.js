const { PrizeTemplate } = require('../models');

// Obtener todas las plantillas de premio
const getPrizeTemplates = async (req, res) => {
  try {
      const templates = await PrizeTemplate.find()
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: { templates } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener una plantilla de premio por ID
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

// Crear nueva plantilla de premio
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

// Actualizar plantilla de premio
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

// Eliminar plantilla de premio
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

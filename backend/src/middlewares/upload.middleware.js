/**
 * @fileoverview Middleware de Subida de Archivos
 * @description Configura multer para gestionar la subida de imágenes
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * @const storage
 * @description Configuración de almacenamiento en disco para multer
 * - Destino: carpeta especificada en UPLOAD_DIR o './uploads'
 * - Nombre de archivo: {fieldname}-{timestamp}-{random}.{ext}
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

/**
 * @function fileFilter
 * @description Filtro que valida que solo se suban imágenes
 * @param {Object} req - Request HTTP
 * @param {Object} file - Archivo subido
 * @param {Function} cb - Callback de multer
 * @returns {void} Llama a cb con true si es válido, o error si no
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
};

/**
 * @const upload
 * @description Instancia de multer configurada con:
 * - Storage: almacenamiento en disco
 * - Limits: tamaño máximo 5MB
 * - FileFilter: solo imágenes
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: fileFilter
});

module.exports = upload;
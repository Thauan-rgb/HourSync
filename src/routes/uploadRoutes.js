const express          = require('express');
const multer           = require('multer');
const path             = require('path');
const fs               = require('fs');
const uploadController = require('../controllers/uploadController');
const authMiddleware   = require('../middlewares/authMiddleware');

const router = express.Router();

// Garante que a pasta existe
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['.pdf', '.png', '.jpg', '.jpeg'];
  const ext     = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) return cb(null, true);
  cb(new Error('Tipo de arquivo não permitido. Use PDF, PNG ou JPG.'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

router.post('/', authMiddleware, upload.single('file'), uploadController.enviar);

module.exports = router;

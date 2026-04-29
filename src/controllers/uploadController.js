const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Diretório de uploads
const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não suportado. Envie PDF, JPG ou PNG."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// POST /upload
const enviarArquivo = [
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }

    // URL pública do arquivo
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;

    res.json({ url, filename: req.file.filename });
  },
];

module.exports = { enviarArquivo };

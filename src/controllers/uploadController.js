const path = require('path');

async function enviar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const url     = `${baseUrl}/uploads/${req.file.filename}`;

    return res.status(200).json({ url, filename: req.file.filename });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao fazer upload.', error: err.message });
  }
}

module.exports = { enviar };

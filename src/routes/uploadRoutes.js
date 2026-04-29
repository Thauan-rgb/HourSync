const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { enviarArquivo } = require("../controllers/uploadController");

router.post("/", auth, enviarArquivo);

module.exports = router;

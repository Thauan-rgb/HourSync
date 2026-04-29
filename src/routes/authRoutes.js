const express = require("express");
const router = express.Router();
const { login, resetSenha, me } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/login", login);
router.put("/reset-senha", resetSenha);
router.get("/me", authMiddleware, me);

module.exports = router;

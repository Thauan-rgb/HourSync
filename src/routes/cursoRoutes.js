const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const { listar, buscarPorId, criar, atualizar, remover } = require("../controllers/cursoController");

router.get("/", auth, listar);
router.get("/:id", auth, buscarPorId);
router.post("/", auth, role("SUPER_ADMIN"), criar);
router.put("/:id", auth, role("SUPER_ADMIN", "COORDENADOR"), atualizar);
router.delete("/:id", auth, role("SUPER_ADMIN"), remover);

module.exports = router;

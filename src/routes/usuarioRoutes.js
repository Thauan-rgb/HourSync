const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const {
  listar,
  listarCoordenadores,
  listarAlunos,
  buscarPorId,
  criar,
  atualizar,
  ativarInativar,
  alterarSenha,
  remover,
} = require("../controllers/usuarioController");

// Listagens
router.get("/", auth, role("SUPER_ADMIN"), listar);
router.get("/coordenadores", auth, role("SUPER_ADMIN"), listarCoordenadores);
router.get("/alunos", auth, role("SUPER_ADMIN", "COORDENADOR"), listarAlunos);

// CRUD individual
router.get("/:id", auth, buscarPorId);
router.post("/", auth, role("SUPER_ADMIN"), criar);
router.put("/:id", auth, atualizar);
router.put("/:id/ativo", auth, role("SUPER_ADMIN"), ativarInativar);
router.put("/:id/senha", auth, alterarSenha);
router.delete("/:id", auth, role("SUPER_ADMIN"), remover);

module.exports = router;

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const {
  listar,
  buscarPorId,
  listarPorAluno,
  listarPorCurso,
  listarPorStatus,
  submeter,
  validar,
  remover,
} = require("../controllers/certificadoController");

// Listagens (ordem importa — rotas específicas antes de :id)
router.get("/", auth, role("SUPER_ADMIN", "COORDENADOR"), listar);
router.get("/aluno/:alunoId", auth, listarPorAluno);
router.get("/curso/:cursoId", auth, role("SUPER_ADMIN", "COORDENADOR"), listarPorCurso);
router.get("/status/:status", auth, role("SUPER_ADMIN", "COORDENADOR"), listarPorStatus);
router.get("/:id", auth, buscarPorId);

// Ações
router.post("/", auth, submeter);
router.patch("/:id/validar", auth, role("SUPER_ADMIN", "COORDENADOR"), validar);
router.delete("/:id", auth, role("SUPER_ADMIN"), remover);

module.exports = router;

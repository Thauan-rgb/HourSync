const express           = require('express');
const usuarioController = require('../controllers/usuarioController');
const authMiddleware    = require('../middlewares/authMiddleware');
const roleMiddleware    = require('../middlewares/roleMiddleware');

const router = express.Router();

const admin = roleMiddleware('SUPER_ADMIN');
const staff = roleMiddleware('SUPER_ADMIN', 'COORDENADOR');

// Listagens especializadas (devem vir antes de /:id)
router.get('/coordenadores', authMiddleware, staff,  usuarioController.listarCoordenadores);
router.get('/alunos',        authMiddleware, staff,  usuarioController.listarAlunos);

// CRUD geral
router.get('/',          authMiddleware, admin, usuarioController.listar);
router.get('/:id',       authMiddleware, staff, usuarioController.buscarPorId);
router.post('/',         authMiddleware, admin, usuarioController.criar);
router.put('/:id',       authMiddleware, admin, usuarioController.atualizar);
router.put('/:id/ativo', authMiddleware, admin, usuarioController.ativarInativar);
router.patch('/:id/senha', authMiddleware, admin, usuarioController.atualizarSenha);
router.delete('/:id',    authMiddleware, admin, usuarioController.remover);

module.exports = router;

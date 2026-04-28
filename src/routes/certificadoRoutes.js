const express               = require('express');
const certificadoController = require('../controllers/certificadoController');
const authMiddleware        = require('../middlewares/authMiddleware');
const roleMiddleware        = require('../middlewares/roleMiddleware');

const router = express.Router();
const admin  = roleMiddleware('SUPER_ADMIN');
const staff  = roleMiddleware('SUPER_ADMIN', 'COORDENADOR');
const auth   = authMiddleware;

router.get('/',                      auth, staff,  certificadoController.listar);
router.get('/aluno/:alunoId',        auth,         certificadoController.listarPorAluno);
router.get('/curso/:cursoId',        auth, staff,  certificadoController.listarPorCurso);
router.get('/status/:status',        auth, staff,  certificadoController.listarPorStatus);
router.get('/:id',                   auth,         certificadoController.buscarPorId);
router.post('/',                     auth,         certificadoController.submeter);
router.put('/:id',                   auth,         certificadoController.atualizar);
router.patch('/:certId/validar',     auth, staff,  certificadoController.validar);
router.delete('/:id',                auth, admin,  certificadoController.remover);

module.exports = router;

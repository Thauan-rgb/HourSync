const express             = require('express');
const categoriaController = require('../controllers/categoriaController');
const authMiddleware      = require('../middlewares/authMiddleware');
const roleMiddleware      = require('../middlewares/roleMiddleware');

const router = express.Router();
const admin  = roleMiddleware('SUPER_ADMIN');
const staff  = roleMiddleware('SUPER_ADMIN', 'COORDENADOR');
const auth   = authMiddleware;

router.get('/',                  auth, categoriaController.listar);
router.get('/curso/:cursoId',    auth, categoriaController.listarPorCurso);
router.get('/:id',               auth, categoriaController.buscarPorId);
router.post('/',                 auth, admin, categoriaController.criar);
router.put('/:id',               auth, admin, categoriaController.atualizar);
router.delete('/:id',            auth, admin, categoriaController.remover);

module.exports = router;

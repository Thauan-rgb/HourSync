const express          = require('express');
const cursoController  = require('../controllers/cursoController');
const authMiddleware   = require('../middlewares/authMiddleware');
const roleMiddleware   = require('../middlewares/roleMiddleware');

const router = express.Router();
const admin  = roleMiddleware('SUPER_ADMIN');
const auth   = authMiddleware;

router.get('/',      auth, cursoController.listar);
router.get('/:id',   auth, cursoController.buscarPorId);
router.post('/',     auth, admin, cursoController.criar);
router.put('/:id',   auth, admin, cursoController.atualizar);
router.delete('/:id',auth, admin, cursoController.remover);

module.exports = router;

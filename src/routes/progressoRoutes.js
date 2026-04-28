const express             = require('express');
const progressoController = require('../controllers/progressoController');
const authMiddleware      = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/aluno/:alunoId',   authMiddleware, progressoController.porAluno);
router.get('/curso/:cursoId',   authMiddleware, progressoController.porCurso);
router.get('/calculo/:certId',  authMiddleware, progressoController.calculo);

module.exports = router;

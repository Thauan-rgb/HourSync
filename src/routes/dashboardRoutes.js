const express             = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware      = require('../middlewares/authMiddleware');
const roleMiddleware      = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/admin',                authMiddleware, roleMiddleware('SUPER_ADMIN'), dashboardController.admin);
router.get('/coordenador/:cursoId', authMiddleware, roleMiddleware('SUPER_ADMIN', 'COORDENADOR'), dashboardController.coordenador);

module.exports = router;

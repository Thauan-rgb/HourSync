const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const { admin, coordenador } = require("../controllers/dashboardController");

router.get("/admin", auth, role("SUPER_ADMIN"), admin);
router.get("/coordenador/:cursoId", auth, role("SUPER_ADMIN", "COORDENADOR"), coordenador);

module.exports = router;

const { Router } = require('express');
const reportesController = require('../controllers/reportes.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.get('/alumnos-vigentes', asyncHandler(reportesController.alumnosVigentes));
router.get('/ejercicios-mas-usados', asyncHandler(reportesController.ejerciciosMasUsados));

module.exports = router;

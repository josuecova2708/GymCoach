const { Router } = require('express');
const asignacionesController = require('../controllers/asignaciones.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.get('/', asyncHandler(asignacionesController.listar));
router.post('/', asyncHandler(asignacionesController.crear));
router.delete('/:id', asyncHandler(asignacionesController.eliminar));

module.exports = router;

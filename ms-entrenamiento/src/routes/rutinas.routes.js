const { Router } = require('express');
const rutinasController = require('../controllers/rutinas.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.get('/', asyncHandler(rutinasController.listar));
router.post('/', asyncHandler(rutinasController.crear));
router.get('/:id', asyncHandler(rutinasController.obtenerPorId));
router.put('/:id', asyncHandler(rutinasController.actualizar));
router.delete('/:id', asyncHandler(rutinasController.eliminar));

module.exports = router;

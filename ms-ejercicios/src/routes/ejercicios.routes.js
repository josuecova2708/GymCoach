const { Router } = require('express');
const ejerciciosController = require('../controllers/ejercicios.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

// /batch tiene que ir antes de /:id, si no Express toma "batch" como el parámetro id.
router.get('/batch', asyncHandler(ejerciciosController.batch));
router.get('/', asyncHandler(ejerciciosController.listar));
router.post('/', asyncHandler(ejerciciosController.crear));
router.get('/:id', asyncHandler(ejerciciosController.obtenerPorId));
router.put('/:id', asyncHandler(ejerciciosController.actualizar));
router.delete('/:id', asyncHandler(ejerciciosController.eliminar));

module.exports = router;

const { Router } = require('express');
const alumnosController = require('../controllers/alumnos.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.get('/', asyncHandler(alumnosController.listar));
router.post('/', asyncHandler(alumnosController.crear));
router.get('/:id', asyncHandler(alumnosController.obtenerPorId));
router.put('/:id', asyncHandler(alumnosController.actualizar));
router.delete('/:id', asyncHandler(alumnosController.eliminar));

module.exports = router;

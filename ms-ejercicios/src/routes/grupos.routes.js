const { Router } = require('express');
const gruposController = require('../controllers/grupos.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.get('/', asyncHandler(gruposController.listar));
router.post('/', asyncHandler(gruposController.crear));
router.put('/:id', asyncHandler(gruposController.actualizar));
router.delete('/:id', asyncHandler(gruposController.eliminar));

module.exports = router;

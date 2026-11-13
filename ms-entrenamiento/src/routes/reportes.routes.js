const { Router } = require('express');
const reportesController = require('../controllers/reportes.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.get('/:tipo', asyncHandler(reportesController.generar));

module.exports = router;

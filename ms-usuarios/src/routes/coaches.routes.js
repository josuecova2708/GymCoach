const { Router } = require('express');
const coachesController = require('../controllers/coaches.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.get('/:id', asyncHandler(coachesController.obtenerPorId));

module.exports = router;

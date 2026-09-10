const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.post('/login', asyncHandler(authController.login));

module.exports = router;

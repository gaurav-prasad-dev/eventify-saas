const express = require('express');
const userController = require('./user.controller');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const validate = require('../../shared/middleware/validate.middleware');
const { updateProfileSchema } = require('./user.validation');

const router = express.Router();

// All profile endpoints require authentication
router.use(authMiddleware);

router.get('/', userController.getProfile);
router.patch('/', validate(updateProfileSchema), userController.updateProfile);

module.exports = router;

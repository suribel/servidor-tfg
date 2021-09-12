const express = require('express');
const AuthController = require('../controllers/auth');
const authentication = require('../middlewares/authentication');

const api = express.Router();

api.post("/refresh-token",[authentication.authenticateRefreshToken], AuthController.refreshToken);
api.post("/reset-psw-inside",[authentication.authenticateToken], AuthController.resetPasswordInside);
api.post("/forgot-psw", AuthController.forgotPassword);
api.post("/validate-reset-psw/:code", AuthController.validateResetPassword);
api.post("/reset-psw/:code", AuthController.resetPassword);




module.exports = api;





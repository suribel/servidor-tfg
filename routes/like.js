const express = require('express');
const LikeController = require('../controllers/like');
const authentication = require('../middlewares/authentication');

const api = express.Router();

api.get('/get-like/:id', [authentication.authenticateToken], LikeController.getLike);
api.post('/set-like/:id', [authentication.authenticateToken], LikeController.setLike);
api.delete('/delete-like/:id', [authentication.authenticateToken], LikeController.deleteLike);

module.exports = api;
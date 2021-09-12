const express = require('express');
const FollowController = require('../controllers/follow');
const authentication = require('../middlewares/authentication');

const api = express.Router();

api.get('/is-follower/:id', [authentication.authenticateToken], FollowController.isFollower);
api.get('/count-followers/:id', FollowController.countFollowers);
api.post('/set-follower/:id', [authentication.authenticateToken], FollowController.setFollower);
api.delete('/delete-follower/:id', [authentication.authenticateToken], FollowController.deleteFollower);

module.exports = api;
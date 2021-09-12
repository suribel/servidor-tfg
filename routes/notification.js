const express = require('express');
const NotificationController = require('../controllers/notification');
const authentication = require('../middlewares/authentication');

const api = express.Router();

api.get('/get-notifications', [authentication.authenticateToken], NotificationController.getNotifications);
api.get('/count-notifications', [authentication.authenticateToken], NotificationController.countNotifications);
api.post('/read-notifications/:id', [authentication.authenticateToken], NotificationController.readNotifications);

module.exports = api;
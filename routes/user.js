const express = require('express');
const UserController = require('../controllers/user');
const authentication = require('../middlewares/authentication');

let multer = require('multer');
let upload = multer({
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('El formato debe ser png o jpg'));
    }
  }
});

const api = express.Router();

api.post('/sign-up', UserController.signUp);
api.post('/sign-in', UserController.signIn);
api.get('/user/:username', UserController.getUser);
api.get('/user-by-id/:id', UserController.getUserById);
api.put('/upload-avatar', [authentication.authenticateToken, upload.single('avatar')], UserController.uploadAvatar);
api.put('/delete-avatar', [authentication.authenticateToken], UserController.deleteAvatar);
api.get('/users', [authentication.authenticateToken], UserController.getUsers);
api.get('/search-user', UserController.searchUser);
api.get('/exist-user/:username', UserController.existUser);
api.put('/update-username', [authentication.authenticateToken], UserController.updateUsername);
api.put('/update-user', [authentication.authenticateToken], UserController.updateUser);
api.get('/activate-user/:code', UserController.activateUser);




module.exports = api;



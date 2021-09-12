const express = require('express');
const SponsorsController = require('../controllers/sponsor');
const authentication = require('../middlewares/authentication');

const multer = require('multer');
const upload = multer({
    limits: {
        fileSize: 15000000, // 150 KB for a 1080x1080 JPG 90
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
          cb(null, true);
        } else {
          cb(null, false);
          return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
      }
});

const api = express.Router();

api.get('/get-sponsors', SponsorsController.getSponsors);
api.post('/set-sponsor/:id',  [authentication.authenticateToken, upload.single('photo')], SponsorsController.setSponsor);
api.delete('/delete-sponsor/:id', [authentication.authenticateToken], SponsorsController.deleteSponsor);

module.exports = api;
const ReleaseController = require('../controllers/release');
const express = require('express');
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

api.post("/publication/publicar", [authentication.authenticateToken, upload.single('photo')], ReleaseController.setPublication);
api.get("/publication/:id", ReleaseController.getPublication);
api.get("/publication-in-progress/:id", [authentication.authenticateToken], ReleaseController.getPublicationInProgress);
api.get("/publications-in-progress", [authentication.authenticateToken], ReleaseController.getPublicationsInProgress);
api.get("/publications-user/:username", ReleaseController.getPublicationsUser);
api.get("/publications-user-saved", [authentication.authenticateToken], ReleaseController.getPublicationsUserSaved);
api.put("/accepted-publication/:id", [authentication.authenticateToken], ReleaseController.setAcceptedPublication);
api.get("/browse", ReleaseController.browse);
api.get("/count-publications/:id", ReleaseController.countPublications);
api.get("/get-categories", ReleaseController.getCategories);
api.post("/set-category/:name",[authentication.authenticateToken], ReleaseController.setCategory);
api.post("/delete-category/:name",[authentication.authenticateToken], ReleaseController.deleteCategory);




module.exports = api;


const Sponsors = require('../models/sponsor');
const { v4: uuidv4 } = require('uuid');

const awsUploadImage = require("../utils/upload_aws"); 


function setSponsor(req, res) {
  const publication_id = req.params.id;
  const role = req.user.role;

  if (role != "ADMIN") {
    res.status(400).send({ message: "No autorizado." });
  } else {
    if (publication_id) {

        if (req.file) {
          var ext = req.file.mimetype.split("/")[1];
          var namePhoto = `sponsors/${uuidv4()}.${ext}`;
    
          awsUploadImage(req.file.buffer, namePhoto)
            .then(location => {
    
                    const sponsor = new Sponsors();
                    sponsor.photo = location;
                    sponsor.publication_id = publication_id;
    
                    sponsor.save((err, result2) => {
                      if (err) {
                        res.status(500).send({ message: err });
                      } else {
                        if (!result2) {
                          res.status(500).send({ message: "Error al crea el Sponsor" });
                        } else {
                          res.status(200).send({ fail: false, message: "Sponsor creado con exito" });
                        }
                      }
                    });
    
    
            })
            .catch(() => {
              res.status(500).send({ message: "Error del servidor aws." });
            });;
    
        } else {
          res.status(500).send({ message: "Error no hay archivo." });
        }
      } else {
        return res.status(500).send({
          message: "Error validacion"
        });
      }
  }
  

}


function getSponsors(req, res) {

    Sponsors.find({}, (err, result) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor." });
        } else {
            if (!result) {
                res.status(404).send({ message: "false" });
            } else {
                res.status(200).send({ message: result });
            }
        }
    });
}


function deleteSponsor(req, res) {
    const publication_id = req.params.id;
    const role = req.user.role;
  
    if (role != "ADMIN") {
      res.status(400).send({ message: "No autorizado." });
    }
    else {
        Sponsors.findOneAndRemove({ publication_id }, (err, result) => {
            if (err) {
                res.status(500).send({ message: "Error del servidor." });
            } else {
                if (!result) {
                    res.status(404).send({ message: "false" });
                } else {
                    res.status(200).send({ message: "true" });
                }
            }
        });
    }
    
}


module.exports = {
    getSponsors,
    setSponsor,
    deleteSponsor
};
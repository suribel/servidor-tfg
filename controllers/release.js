const { v4: uuidv4 } = require('uuid');
const { Release, Category } = require("../models/release");
const User = require('../models/user');
const Notification = require('../models/notification');
const Like = require('../models/like');
const validator = require('validator');
const Follow = require('../models/follow');


const awsUploadImage = require("../utils/upload_aws");


function setPublication(req, res) {
  const { title, description, start_date, category, url_check, url_site } = req.body;
  const user_id = req.user.id;

  if (title && description && start_date && url_check) {
    if (req.file) {
      var ext = req.file.mimetype.split("/")[1];
      var namePhoto = `release/${uuidv4()}.${ext}`;

      awsUploadImage(req.file.buffer, namePhoto)
        .then(location => {
          User.findById(user_id, (err, result) => {
            if (err) {
              res.status(500).send({ message: "Error del servidor." });
            } else {
              if (!result) {
                res.status(404).send({ message: "No se ha encontrado ningun usuario." });
              } else {
                const release = new Release();
                const categorySchema = new Category();
                categorySchema.name = category;
                release.photo = location;
                release.title = title;
                release.description = description;
                release.start_date = start_date;
                release.category = categorySchema;
                release.url_check = url_check;
                release.url_site = url_site;
                release.user_id = user_id;
                release.status = "PROCESSING";
                if (result.verificate) {
                  release.status = "ACCEPTED";
                }

                release.save((err, result2) => {
                  if (err) {
                    res.status(500).send({ message: err });
                  } else {
                    if (!result2) {
                      res.status(500).send({ message: "Error al crea el Publication" });
                    } else {
                      if (result2.status = "ACCEPTED") {
                        if (sendNotification(user_id, title, location, result2._id) == 200) {
                          res.end(200).send({ message: "Publication y notificacion creado con exito" });
                        }
                        res.status(200).send({ message: "Publication creado con exito y notificacion no" });
                      } else {
                        res.status(200).send({ message: "Publication creado con exito" });
                      }
                    }
                  }
                });
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
    res.status(500).send({ message: "Error de validacion" });
  }
}


function getPublication(req, res) {
  const id = req.params.id;

  Release.findById({ _id: id }, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!result) {
        res.status(404).send({ message: "No se ha encontrado ningun publicacion." });
      } else {
        console.log(result);
        res.status(200).send({ release: result });
      }
    }
  });
}


function getPublicationInProgress(req, res) {
  const id = req.params.id;
  const role = req.user.role;

  if (role != "ADMIN") {
    res.status(400).end({ message: "No autorizado." });
  }

  Release.findById({ _id: id }, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!result) {
        res.status(404).send({ message: "No se ha encontrado ningun Publication en proceso de validacion." });
      } else {
        res.status(200).send({ release: result });
      }
    }
  });
}

function getPublicationsInProgress(req, res) {
  const role = req.user.role;

  if (role != "ADMIN") {
    res.status(400).end({ message: "No autorizado." });
  }

  Release.find({ status: "PROCESSING" }, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!result) {
        res.status(404).send({ message: "No se ha encontrado ningun Publication en progreso de validacion." });
      } else {
        res.status(200).send({ release: result });
      }
    }
  }).select([
    'title',
    'user_id',
    'create_at',
  ]);
}


function getPublicationsUser(req, res) {
  const username = req.params.username;

  User.findOne({ username }, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!result) {
        res.status(404).send({ message: "No se ha encontrado ningun usuario." });
      } else {
        Release.find({ user_id: result._id, status: "ACCEPTED" }, (err, result2) => {
          if (err) {
            res.status(500).send({ message: "Error del servidor." });
          } else {
            if (!result2) {
              res.status(404).send({ message: "No se ha encontrado ningun Publication." });
            } else {
              res.status(200).send({ releases: result2 });
            }
          }
        }).sort({ start_date: -1 });
      }
    }
  });
}



function getPublicationsUserSaved(req, res) {
  const user_id = req.user.id;

  Like.find({ user_id }, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!result) {
        res.status(404).send({ message: "No se ha encontrado ningun usuario." });
      } else {
        var arrayId = [];
        result.forEach(function (row) {
          arrayId.push(row.publication_id);
        });
        Release.find({ _id: { $in: arrayId } }, (err, result2) => {
          if (err) {
            res.status(500).send({ message: "Error del servidor." });
          } else {
            if (!result2) {
              res.status(404).send({ message: "No se ha encontrado ningun Publication." });
            } else {
              res.status(200).send({ releases: result2 });
            }
          }
        }).sort({ start_date: -1 })
      }
    }
  }).select([
    'publication_id',
    '-_id',
  ]);
}





function setAcceptedPublication(req, res) {
  const id = req.params.id;
  var accepted = req.body.accepted;
  var reason = req.body.reason;
  const role = req.user.role;

  if (role != "ADMIN") {
    res.status(400).end({ message: "No autorizado." });
  }
  Release.findByIdAndUpdate(id, { status: accepted, reason: reason }, (err, result) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor." });
    } else {
      if (!result) {
        res.status(404).send({ code: 404, message: "No se ha encontrado ningun Publication." });
      } else {
        if (accepted == "ACCEPTED") {
          //Enviar notificacion
          Follow.find({ user_id: result.user_id }, (err, encontrado) => {
            if (err) {
              res.status(500).send({ message: "Error del servidor." });
            } else {
              if (!encontrado) {
                res.status(404).send({ message: "false" });
              } else {
                var arrayUsers = [];
                encontrado.forEach(function (row) {
                  arrayUsers.push({
                    user_id: row.follower,
                    read: false
                  });
                });

                const notification = new Notification();
                notification.user_id = result.user_id;
                notification.users = arrayUsers;
                notification.title = result.title;
                notification.photo = result.photo;
                notification.publication_id = result._id;

                notification.save((err, result2) => {
                  if (err) {
                    res.status(500).send({ message: err });
                  } else {
                    if (!result2) {
                      res.status(500).send({ message: "Error" });
                    } else {
                      res.status(200).send({ message: "ok" });
                    }
                  }
                });
              }
            }
          });
        } else {
          res.status(200).send({ message: "ok" });
        }
      }
    }
  });
}



function sendNotification(user_id, title, photo, publication_id) {
  //Enviar notificacion
  Follow.find({ user_id: user_id }, (err, encontrado) => {
    if (err) {
      return 500;
    } else {
      if (!encontrado) {
        return 404;
      } else {
        var arrayUsers = [];
        encontrado.forEach(function (row) {

          arrayUsers.push({
            user_id: row.follower,
            read: false
          });

        });

        const notification = new Notification();
        notification.user_id = user_id;
        notification.users = arrayUsers;
        notification.title = title;
        notification.photo = photo;
        notification.publication_id = publication_id;

        notification.save((err, result2) => {
          if (err) {
            return 500;
          } else {
            if (!result2) {
              return 500;
            } else {
              return 200;
            }
          }
        });
      }
    }
  });
}





function browse(req, res) {
  var { q = "", category = null, sortBy, sortDir, end = "false" } = req.query;
  const { page = 1 } = req.query;

  if (sortBy != 'start_date' && sortBy != 'create_at') {
    sortBy = 'start_date';
  }
  if (sortDir != 'asc' && sortDir != 'desc') {
    sortDir = 'asc';
  }
  if (end == "true") {
    date = new Date('2021-01-01T00:00:00');
  } else {
    date = Date.now();

  }
  //validar
  var query = {
    status: "ACCEPTED",
    title: { $regex: q, $options: "i" },
    start_date: {
      $gte: date,
    }
  }
  
  if (category != null && category != "") {
    query = {
      status: "ACCEPTED",
      "category.name": category,
      title: { $regex: q, $options: "i" },
      start_date: {
        $gte: date,
      }
    }
  }

  const options = {
    page: page,
    limit: 5,
    sort: { [sortBy]: sortDir },
  };

  Release.paginate(query, options, function (err, result) {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    }
    else {
      res.status(200).send({ publications: result.docs, hasNextPage: result.hasNextPage, count: result.totalDocs });
    }
  });

}


function countPublications(req, res) {
  const user_id = req.params.id;
  console.log("user_id", user_id);

  Release.countDocuments({ user_id, status: "ACCEPTED" }, (err, result) => {
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

function getCategories(req, res) {

  Category.find({}, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!result) {
        res.status(404).send({ message: "No se ha encontrado ningun" });
      } else {
        res.status(200).send({ message: result });
      }
    }
  });

}


function setCategory(req, res) {

  const name = req.params.name;
  const role = req.user.role;

  if (role != "ADMIN") {
    res.status(400).end({ message: "No autorizado." });
  } else {
    if (name) {
      const category = new Category();

      category.name = name;

      category.save((err, result) => {
        if (err) {
          res.status(500).send({ message: "Error al guardar" });
        } else {
          if (!result) {
            res.status(404).send({ message: "Error al crear category" });
          } else {
            res.status(200).send({ message: result });
          }
        }
      });
    } else {
      res.status(404).send({ message: "Faltan datos" });
    }
  }

}

function deleteCategory(req, res) {
  const name = req.params.name;
  const role = req.user.role;

  if (role != "ADMIN") {
    res.status(400).end({ message: "No autorizado." });
  } else {
    Category.findOneAndRemove({ name }, (err, result) => {
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
  setPublication,
  getPublication,
  getPublicationsUser,
  getPublicationsUserSaved,
  getPublicationInProgress,
  getPublicationsInProgress,
  setAcceptedPublication,
  browse,
  countPublications,
  getCategories,
  setCategory,
  deleteCategory
};
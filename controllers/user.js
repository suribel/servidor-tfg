const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const User = require('../models/user');
const jwt = require('../services/jwt');
const validator = require('validator');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require("nodemailer");
require("dotenv").config({ path: ".env" });


const transporter = nodemailer.createTransport({
    host: "email-smtp.eu-west-3.amazonaws.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.user,
        pass: process.env.pass,
    },
});

const awsUploadImage = require("../utils/upload_aws");


function signUp(req, res) {

    const { name, username, email, password } = req.body;

    try {
        var validate_email = !validator.isEmpty(email) && validator.isEmail(email);
        var validate_password = !validator.isEmpty(password);
        var validate_name = !validator.isEmpty(name);
        var validate_username = !validator.isEmpty(username);
    } catch (err) {
        return res.status(500).send({
            message: "Faltan datos por enviar"
        });
    }

    // validar los datos (utilizamos la libreria validator)
    if (validate_email && validate_password && validate_name && validate_username) {
        const user = new User();

        user.name = name;
        user.username = username.toLowerCase();
        user.email = email.toLowerCase();
        user.active = false;
        user.confirmation_code = uuidv4();

        User.findOne({ email: user.email }, (err, result) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al comprobar usuario"
                });
            }
            else {
                if (result) {
                    res.status(200).send({ fail: true, message: "email ya existe." });
                }
                else {
                    User.findOne({ username: user.username }, (err, result2) => {
                        if (err) {
                            return res.status(500).send({
                                message: "Error al comprobar usuario"
                            });
                        }
                        else {
                            if (result2) {
                                res.status(200).send({ fail: true, message: "Username ya existe." });
                            }
                            else {
                                bcryptjs.hash(password, saltRounds, function (err, hash) {
                                    if (err) {
                                        res.status(500).send({ message: "Error al encriptar contraseña" });
                                    } else {
                                        user.password = hash;

                                        transporter.sendMail({
                                            from: 'release.radar.email@gmail.com', // sender address
                                            to: user.email, // list of receivers
                                            subject: "Please confirm your account", // Subject line
                                            text: "Hello world", // plain text body
                                            html: `<h1>Email Confirmation</h1>
                                                    <h2>Hello Human</h2>
                                                    <p>Please, confirm your email by clicking on the following link</p>
                                                    <a href=http://localhost:3000/confirm-email/${user.confirmation_code}> Confirm here</a>
                                                    </div>`, // html body
                                        }).then(result => {
                                            user.save((err, userStored) => {
                                                if (err) {
                                                    res.status(500).send({ message: err });
                                                } else {
                                                    if (!userStored) {
                                                        res.status(500).send({ message: "Error al crea el usuario" });
                                                    } else {
                                                        res.status(200).send({ fail: false, message: "Usuario creado con exito" });
                                                    }
                                                }
                                            });

                                        }).catch((err) => {
                                            res.status(500).send({ message: err });
                                        });

                                    }
                                });

                            }
                        }
                    });

                }
            }

        });
    }
    else {
        return res.status(500).send({
            message: "Error validacion"
        });
    }
}



function signIn(req, res) {
    const params = req.body;
    const email = params.email.toLowerCase();
    const password = params.password;

    //validar
    try {
        var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var validate_password = !validator.isEmpty(params.password);
    } catch (err) {
        res.status(500).send({ message: "Faltan datos por enviar" });
    }

    if (validate_email && validate_password) {
        User.findOne({ email }, (err, result) => {
            if (err) {
                res.status(500).send({ message: "Error del servidor" });
            }
            else {
                if (!result) {
                    res.status(404).send({ message: "Usuario o contraseña no existe." });
                }
                else if (!result.active) {
                    res.status(404).send({ message: "El usuario no está activado" });
                } else {
                    bcryptjs.compare(password, result.password, (err, check) => {
                        if (err) {
                            res.status(500).send({ message: "Error del servidor" });
                        } else if (!check) {
                            res.status(404).send({ message: "Usuario o contraseña no existe." });
                        } else {
                            try {
                                res.status(200).send({ accessToken: jwt.createAccesToken(result, "10m"), refreshToken: jwt.createRefreshToken(result, "30d") });
                            } catch (error) {
                                res.status(500).send({ message: "Error del servidor" });
                            }
                        }
                    })
                }
            }
        });
    }
    else {
        res.status(500).send({ message: "Error validacion" });
    }
}

function activateUser(req, res) {
    const confirmation_code = req.params.code;
    // hacer comprobacion si ya esta activado sino activar
    User.findOneAndUpdate({ confirmation_code }, { active: true }, (err, result) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor" });
        } else {
            if (!result) {
                res.status(404).send({ message: "No se ha encontrado el usuario." });
            } else {
                res.status(200).send({ message: "ok" });
            }
        }
    });
}


async function getUser(req, res) {

    const username = req.params.username;

    const result = await User.findOne({ username }).select([
        'name',
        'username',
        'avatar',
        'verificate',
        '_id',
    ]);

    if (result) {
        res.status(200).json(result);
    } else {
        res.status(404).send({ message: "El usuario no existe" });
        //res.status(404).send({ message: "no se ha encontrado niungun usuario" });
    }

}

async function getUserById(req, res) {

    const _id = req.params.id;

    const result = await User.findById({ _id }).select([
        'name',
        'username',
        'avatar',
        'role',
        '-_id',
    ]);

    if (result) {
        res.status(200).json(result);
    } else {
        res.status(404).send({ message: "El usuario no existe" });
        //res.status(404).send({ message: "no se ha encontrado niungun usuario" });
    }

}



function uploadAvatar(req, res) {
    const id = req.user.id;

    User.findById({ _id: id }, (err, result) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor." });
        } else {
            if (!result) {
                res.status(404).send({ message: "No se ha encontrado ningun usuario." });
            } else {
                if (req.file) {
                    var ext = req.file.mimetype.split("/")[1];
                    var nameAvatar = `avatar/${id}.${ext}`;

                    awsUploadImage(req.file.buffer, nameAvatar)
                        .then(avatar => {
                            User.findByIdAndUpdate({ _id: id }, { avatar }, (err, userResult) => {
                                if (err) {
                                    res.status(500).send({ message: "Error del servidor." });
                                } else {
                                    res.status(200).send({ message: avatar });
                                }
                            });
                        })
                        .catch(() => {
                            res.status(500).send({ message: "Error del servidor aws." });
                        });;
                } else {
                    res.status(500).send({ message: "Error no hay archivo." });
                }
            }
        }
    })
}


function deleteAvatar(req, res) {
    const id = req.user.id;

    User.findByIdAndUpdate({ _id: id }, { avatar: "" }, (err, result) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor." });
        } else {
            res.status(200).send({ message: "Avatar eliminado" });
        }
    });

}


function updateUsername(req, res) {
    const { username } = req.body;
    const id = req.user.id;

    //comprobacion inicial para saltar msg en front
    User.findOne({ username }, (err, result) => {
        if (err) {
            return res.status(500).send({
                message: "Error al comprobar usuario"
            });
        }
        else {
            if (result) {
                res.status(401).send({ fail: true, message: "Username ya existe." });
            }
            else {
                User.findByIdAndUpdate({ _id: id }, { username }, (err, result2) => {
                    if (err) {
                        res.status(500).send({ message: "Error del servidor2." });
                    } else {
                        if (!result2) {
                            res.status(404).send({ message: "No se ha encontrado ningun usuario." });
                        } else {
                            res.status(200).send({ message: "Usuario actualizado correctamente." });
                        }
                    }
                });
            }
        }
    });
}

function updateUser(req, res) {
    const { name } = req.body;
    const id = req.user.id;

    User.findByIdAndUpdate({ _id: id }, { name }, (err, result) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor." });
        } else {
            if (!result) {
                res.status(404).send({ message: "No se ha encontrado ningun usuario." });
            } else {
                res.status(200).send({ message: "Usuario actualizado correctamente." });
            }
        }
    });
}


function existUser(req, res) {
    var username = req.params.username;


    User.exists({ username }, (err, result) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor." });
        } else {
            if (!result) {
                res.status(404).send({ message: result });
            } else {
                res.status(200).send({ message: result });
            }
        }
    });
}






function getUsers(req, res) {

    User.find({}, (err, result) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor." });
        }
        else {
            if (!result) {
                res.status(404).send({ message: "no se ha encontrado niungun usuario" });
            } else {
                res.status(200).send(result);
            }
        }
    });


}


function searchUser(req, res) {

    const user = req.query.q;
    console.log("user", user);

    User.find({ username: { $regex: user, $options: "i" } }, (err, result) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor." });
        }
        else {
            if (!result) {
                res.status(404).send({ message: "no se ha encontrado niungun usuario" });
            } else {
                res.status(200).send({ users: result });
            }
        }
    }).limit(100);


}





module.exports = {
    signUp,
    signIn,
    getUsers,
    getUser,
    uploadAvatar,
    deleteAvatar,
    updateUsername,
    updateUser,
    getUserById,
    searchUser,
    existUser,
    activateUser
};
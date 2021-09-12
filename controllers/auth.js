const User = require('../models/user');
const Keys = require('../models/keys');
const jwt = require('../services/jwt');
const { v4: uuidv4 } = require('uuid');
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
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

function refreshToken(req, res) {
    const user_id = req.user.id;
    const refreshTokenId = req.user.refreshTokenId;

    console.log("user_id", user_id);
    User.findById({ _id: user_id }, (err, result) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor user" });
        } else {
            if (!result) {
                res.status(401).send({ message: "No autorizado, no se ha encontrado el user" });
            } else {

                Keys.findOne({ user_id: user_id, refreshTokenId: refreshTokenId }, (err, result2) => {
                    if (err) {
                        res.status(500).send({ message: "Error del servidor" });
                    } else {
                        if (!result2) {
                            res.status(401).send({ message: "No autorizado, no se ha encontrado el token" });
                        } else {
                            res.status(200).send({ accessToken: jwt.createAccesToken(result, "10m") });
                        }
                    }
                });
            }
        }
    });
}


function validateResetPassword(req, res) {
    const reset_password_code = req.params.code;

    User.findOne({ reset_password_code: reset_password_code, reset_password_exp: { $gt: Date.now() } }, (err, result) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor user." });
        } else {
            if (!result) {
                res.status(404).send({ message: "false" });
            } else {
                res.status(200).send({ message: "true" });
            }
        }
    });
}


function resetPassword(req, res) {
    const reset_password_code = req.params.code;
    const password = req.body.password;

    if (password && reset_password_code) {
        User.findOne({ reset_password_code: reset_password_code, reset_password_exp: { $gt: Date.now() } }, (err, user) => {
            if (err) {
                res.status(500).send({ message: "Error del servidor user." });
            } else if (!user) {
                res.status(404).send({ message: "No se ha encontrado" });
            }
            else {
                Keys.deleteMany({ user_id: user._id }, (err, ress) => {
                    if (err) {
                        res.status(500).send({ message: "Error del servidor user." });
                    } else {
                        user.reset_password_code = undefined;
                        user.reset_password_exp = undefined;

                        bcryptjs.hash(password, saltRounds, function (err, hash) {
                            if (err) {
                                res.status(500).send({ message: "Error al encriptar contraseña" });
                            } else {
                                user.password = hash;
                                user.save((err, userStored) => {
                                    if (err) {
                                        res.status(500).send({ message: err });
                                    } else {
                                        if (!userStored) {
                                            res.status(500).send({ message: "Error al crea el usuario" });
                                        } else {
                                            res.status(200).send({ message: "Usuario creado con exito" });
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.status(500).send({ message: "Faltan datos por enviar" });
    }
}


function resetPasswordInside(req, res) {
    const id = req.user.id;
    const password = req.body.password;
    const currentPassword = req.body.currentPassword;

    //tiene que saber la password actual para poder acceder aqui
    if (currentPassword && password) {
        User.findById({ _id: id }, (err, user) => {
            if (err) {
                res.status(500).send({ message: "Error del servidor1" });
            }
            else if (!user) {
                res.status(407).send({ message: "Usuario no existe." });
            }
            else {
                bcryptjs.compare(currentPassword, user.password, (err, check) => {
                    if (err) {
                        res.status(500).send({ message: "Error del servidor2" });
                    } else if (!check) {
                        res.status(408).send({ message: "contraseña incorrecta." });
                    } else {
                        Keys.deleteMany({ user_id: id }, (err, result2) => {
                            if (err) {
                                res.status(500).send({ message: "Error del servidor3." });
                            } else {
                                bcryptjs.hash(password, saltRounds, function (err, hash) {
                                    if (err) {
                                        res.status(500).send({ message: "Error al encriptar contraseña" });
                                    } else {
                                        user.password = hash;
                                        user.save((err, userStored) => {
                                            if (err) {
                                                res.status(500).send({ message: err });
                                            } else {
                                                if (!userStored) {
                                                    res.status(500).send({ message: "Error al crea el usuario" });
                                                } else {
                                                    try {
                                                        res.status(200).send({ accessToken: jwt.createAccesToken(userStored, "10m"), refreshToken: jwt.createRefreshToken(userStored, "30d") });
                                                    } catch (error) {
                                                        res.status(500).send({ message: "Error del servidor4" });
                                                    }
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });

                    }
                });
            }

        });

    } else {
        res.status(500).send({ message: "Faltan datos por enviar" });
    }

}



function forgotPassword(req, res) {
    const email = req.body.email;

    User.findOne({ email }, (err, user) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor" });
        }
        else if (!user) {
            res.status(404).send({ message: "Este correo no esta asociado a ninguna cuenta." });
        }
        else {
            user.reset_password_code = uuidv4();
            user.reset_password_exp = Date.now() + 1800000; // 12h

            user.save((err, userStored) => {
                if (err) {
                    res.status(500).send({ message: err });
                } else if (!userStored) {
                    res.status(500).send({ message: "Error al crea el usuario" });
                } else {
                    transporter.sendMail({
                        from: '"ReleaseRadarBot" <release.radar.email@gmail.com>',
                        to: user.email,
                        subject: "Reset Password",
                        text: "Hello world",
                        html: `<h1>Reset Password</h1>
                                <h2>Hello Human</h2>
                                <p>Please, reset your password by clicking on the following link</p>
                                <a href=http://localhost:3000/reset-password/confirm/${user.reset_password_code}>Here</a>
                                </div>`,
                    }).then(result => {
                        res.status(200).send({ message: "Reset password creado con exito" });
                    }).catch((err) => {
                        res.status(500).send({ message: err });
                    });
                }
            });
        }
    });
}

module.exports = {
    refreshToken,
    forgotPassword,
    validateResetPassword,
    resetPassword,
    resetPasswordInside,
};


//https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs
const jwt = require('../services/jwt');

exports.authenticateToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send({message: "No se encontro el header Authorization"});
    }

    const token = req.headers.authorization.replace(/['"]+/g, "");

    try {
        var decodeToken = jwt.verifyAccesToken(token);
    } catch (err) {
        console.log("token no valido");
        //Diferentes tipos de errores que comprende al hacer verify
        return res.status(401).send({message: "El token no es valido"});
    }

    req.user = decodeToken;
    next(); //Para hacer la siguente funcion que tenemos
}

exports.authenticateRefreshToken = (req, res, next) => {
    console.log("refresh token entrando");
    if (!req.headers.authorization) {
        return res.status(401).send({message: "No se encontro el header Authorization"});
    }

    const token = req.headers.authorization.replace(/['"]+/g, "");

    try {
        var decodeToken = jwt.verifyRefreshToken(token);
    } catch (err) {
        //console.log(err); //Diferentes tipos de errores que comprende al hacer verify
        return res.status(401).send({message: "El token no es valido"});
    }

    req.user = decodeToken;
    next(); //Para hacer la siguente funcion que tenemos
}


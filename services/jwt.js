const jwt = require('jsonwebtoken');
const moment = require('moment');
require("dotenv").config({ path: ".env" });
const { v4: uuidv4 } = require('uuid');
const Keys = require('../models/keys');


exports.createAccesToken = function (user, expiresIn) {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  return 'Bearer ' + jwt.sign(payload, process.env.SECRET_KEY, { expiresIn });
};

exports.createRefreshToken = function (user, expiresIn) {
  const rtid = uuidv4();
  const payload = {
    id: user._id,
    refreshTokenId: rtid,
  };  

  // guardamos rt en bd
  const keys = new Keys();
  keys.user_id = user._id;
  keys.refreshTokenId = rtid;

  keys.save((err, resp) => {
    if (err) {
      return err;
    }
  });

  return 'Bearer ' + jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn });
};


exports.verifyAccesToken = function (token) {
  return jwt.verify(token.replace("Bearer ", ""), process.env.SECRET_KEY);
};

exports.verifyRefreshToken = function (token) {
  return jwt.verify(token.replace("Bearer ", ""), process.env.REFRESH_TOKEN_SECRET_KEY);
};


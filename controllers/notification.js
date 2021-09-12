const Notification = require('../models/notification');
const {Release} = require("../models/release");


function getNotifications(req, res) {
  const user_id = req.user.id;
  var date = new Date();
  date.setDate(date.getDate() - 30);

  Notification.find({ "users.user_id": user_id, create_at: { $gte: date } }, (err, result) => {
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


function countNotifications(req, res) {
  const user_id = req.user.id;
  var date = new Date();
  date.setDate(date.getDate() - 30);

  Notification.countDocuments({ users: {$elemMatch: {user_id:user_id, read: false}} }, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!result) {
        res.status(404).send({ message: 0 });
      } else {
        res.status(200).send({ message: result });
      }
    }
  });
}


function readNotifications(req, res) {
  const user_id = req.user.id;
  console.log("entrando en read");
  const id = req.params.id;

  Notification.findOneAndUpdate({ _id:id, "users.user_id": user_id },{$set:{"users.$.read": true }}, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!result) {
        res.status(404).send({ message: "false" });
      } else {
        res.status(200).send({ message: "ok" });
      }
    }
  });
}



module.exports = {
  getNotifications,
  countNotifications,
  readNotifications
};
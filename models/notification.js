const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
  read: {
    type: Boolean,
    default: false
  },

});

const NotificationSchema = Schema({
  publication_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "Publication",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
  title: {
    type: String,
    require: true,
  },
  photo: {
    type: String,
    trim: true,
  },
  create_at: {
    type: Date,
    default: Date.now
  },
  users: [usersSchema]
});

module.exports = mongoose.model("Notification", NotificationSchema);

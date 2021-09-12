const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikeSchema = Schema({
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
});

module.exports = mongoose.model("Like", LikeSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FollowSchema = Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
  follower: {
    type: Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
  create_at: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Follow", FollowSchema);
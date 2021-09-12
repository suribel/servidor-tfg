const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const KeysSchema = Schema({
  user_id: {
    type: String,
    require: true,
    ref: "User",
  },
  refreshTokenId: {
    type: String,
    trim: true,
    require: true,
  },
  
});

module.exports = mongoose.model("Keys", KeysSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SponsorsSchema = Schema({
  publication_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "Publication",
  },
  photo: {
    type: String,
    trim: true,
  },
  
});

module.exports = mongoose.model("Sponsors", SponsorsSchema);
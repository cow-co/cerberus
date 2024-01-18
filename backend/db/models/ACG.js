const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const acgSchema = new Schema({
  name: {
    type: String,
    unique: true,
    index: true,
    dropDups: true,
    required: true,
  },
});

module.exports = ACG = mongoose.model("ACG", acgSchema);

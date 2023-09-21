const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    unique: true,
    index: true,
    dropDups: true,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  acgs: {
    type: Array,
  },
});

module.exports = User = mongoose.model("User", userSchema);

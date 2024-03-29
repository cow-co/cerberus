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
  password: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HashedPassword",
  },
  acgs: [mongoose.SchemaTypes.ObjectId],
});

module.exports = User = mongoose.model("User", userSchema);

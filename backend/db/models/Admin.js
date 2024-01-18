const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// By having a separate collection of admins, we can control access to this
// separately from access to the users collection
const adminSchema = new Schema({
  userId: {
    type: String,
    unique: true,
    index: true,
    dropDups: true,
    required: true,
  },
});

module.exports = Admin = mongoose.model("Admin", adminSchema);

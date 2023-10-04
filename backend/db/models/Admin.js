const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Since our user records may not be backed by the DB (they may be in AD)
// we want to have a separate dedicated table of admins
const adminSchema = new Schema({
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    unique: true,
    index: true,
    dropDups: true,
    required: true,
  },
});

module.exports = Admin = mongoose.model("Admin", adminSchema);

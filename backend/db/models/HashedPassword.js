const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hashedPasswordSchema = new Schema({
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  // Is set to the current time when logged out - effectively invalidating existing tokens
  hashedPassword: {
    type: String,
  },
});

module.exports = HashedPassword = mongoose.model(
  "HashedPassword",
  hashedPasswordSchema
);

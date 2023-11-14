const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hashedPasswordSchema = new Schema({
  // Is set to the current time when logged out - effectively invalidating existing tokens
  hashedPassword: {
    type: String,
  },
});

module.exports = HashedPassword = mongoose.model(
  "HashedPassword",
  hashedPasswordSchema
);

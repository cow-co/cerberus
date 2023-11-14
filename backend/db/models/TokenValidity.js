const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenValiditySchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  // Is set to the current time when logged out - effectively invalidating existing tokens
  minTokenValidity: {
    type: Number,
  },
});

module.exports = TokenValidity = mongoose.model(
  "TokenValidity",
  tokenValiditySchema
);

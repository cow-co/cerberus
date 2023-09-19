const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// TODO we may wish to use this to store data about externally-managed users too?
//  eg. if we wanna use kerberos, we'll still need something to store the ACG mappings...
//  But if we only support DB and AD then let's not worry, since AD stores the ACGs too.
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

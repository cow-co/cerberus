const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// This basically tells us (for the moment) if we have seeded the DB,
// since an entry is put into this collection straight after seeding.
// Could also be used in future for managing versions of stuff like task types
// (eg. if in DB version 1.0 a task type had 2 params but in version 1.1 it has 3 params)
// So we could potentially then use different versions of the same tasks against different implants
const dbStateSchema = new Schema({
  version: {
    type: Number,
    min: 0,
    required: true,
  },
  appliedDate: {
    type: Date,
    required: true,
  },
});

module.exports = DBState = mongoose.model("DBState", dbStateSchema);

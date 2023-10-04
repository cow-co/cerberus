const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// TODO Read- and Write-ACGs (a string identifier for each) - authz checks are
//  easier if the ACG reqs are held here rather than referencing the implant from the ACG model
//  (we can simply grab the ACG from here, and do an "is in <user ACGs list>" check)
const implantSchema = new Schema({
  id: {
    type: String,
    index: true,
    unique: true,
    required: true,
  },
  ip: String,
  os: String,
  beaconIntervalSeconds: {
    type: Number,
    min: 1,
  },
  lastCheckinTime: {
    type: Date,
    min: 1,
  },
  isActive: Boolean,
});

module.exports = Implant = mongoose.model("Implant", implantSchema);

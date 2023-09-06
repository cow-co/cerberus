const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const implantSchema = new Schema({
  id: {
    type: String,
    index: true,
    unique: true,
    required: true,
  },
  ip: String,
  os: String,
  beaconIntervalSeconds: Long,
  lastCheckinTimeSeconds: Long,
  isActive: Boolean,
});

module.exports = Implant = mongoose.model("Implant", implantSchema);

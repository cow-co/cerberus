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
  beaconIntervalMS: {
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

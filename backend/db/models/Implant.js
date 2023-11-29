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
  beaconIntervalSeconds: {
    type: Number,
    min: 1,
  },
  lastCheckinTime: {
    type: Number,
    min: 1,
  },
  isActive: Boolean,
  // ACGs are referenced via their DB ID (for database auth) or active directory ID (for AD auth)
  readOnlyACGs: [String],
  operatorACGs: [String],
});

module.exports = Implant = mongoose.model("Implant", implantSchema);

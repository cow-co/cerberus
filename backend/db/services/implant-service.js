const Implant = require("../models/Implant");

const addImplant = async (details) => {
  await Implant.create({
    id: details.id,
    ip: details.ip,
    os: details.os,
    beaconIntervalSeconds: details.beaconIntervalSeconds,
    lastCheckinTimeSeconds: details.lastCheckinTimeSeconds,
    isActive: true,
  });
};

const updateImplant = async (details) => {
  await Implant.findOneAndUpdate(
    { id: details.id },
    {
      id: details.id,
      ip: details.ip,
      os: details.os,
      beaconIntervalSeconds: details.beaconIntervalSeconds,
      lastCheckinTimeSeconds: details.lastCheckinTimeSeconds,
      isActive: true,
    }
  );
};

const findImplantById = async (id) => {
  let implant = null;
  implant = await Implant.findOne({ id: id });
  return implant;
};

const getAllImplants = async () => {
  let implants = [];
  implants = await Implant.find();
  return implants;
};

module.exports = {
  addImplant,
  updateImplant,
  findImplantById,
  getAllImplants,
};

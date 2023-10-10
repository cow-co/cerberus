const Implant = require("../models/Implant");
const ImplantDTO = require("../../api/dto/ImplantDTO");

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
  const implant = await Implant.findOne({ id: id });
  const dto = new ImplantDTO(
    implant.id,
    implant.ip,
    implant.os,
    implant.beaconIntervalSeconds,
    implant.lastCheckinTime,
    implant.isActive
  );
  return dto;
};

const getAllImplants = async () => {
  const implants = await Implant.find();
  const implantsArray = implants.map(
    (implant) =>
      new ImplantDTO(
        implant.id,
        implant.ip,
        implant.os,
        implant.beaconIntervalSeconds,
        implant.lastCheckinTime,
        implant.isActive
      )
  );
  return implantsArray;
};

module.exports = {
  addImplant,
  updateImplant,
  findImplantById,
  getAllImplants,
};

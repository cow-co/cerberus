const {
  sendMessage,
  entityTypes,
  eventTypes,
} = require("../../utils/web-sockets");
const Implant = require("../models/Implant");
const { log, levels } = require("../../utils/logger");

/**
 * @typedef {object} Implant
 * @property {string} id
 * @property {string} ip
 * @property {string} os
 * @property {number} beaconIntervalSeconds
 * @property {number} lastCheckinTimeSeconds
 *
 * @param {Implant} details The implant to add
 */
const addImplant = async (details) => {
  log("addImplant", `Adding implant`, levels.DEBUG);
  const entity = {
    id: details.id,
    ip: details.ip,
    os: details.os,
    beaconIntervalSeconds: details.beaconIntervalSeconds,
    lastCheckinTime: details.lastCheckinTime,
    isActive: true,
  };
  const created = await Implant.create(entity);
  delete created["_id"];
  sendMessage(entityTypes.IMPLANTS, eventTypes.CREATE, created);
};

/**
 * @param {Implant} details The implant to update with
 */
const updateImplant = async (details) => {
  log("updateImplant", `Updating implant ${details.id}`, levels.DEBUG);
  const updatedEntity = {
    id: details.id,
    ip: details.ip,
    os: details.os,
    beaconIntervalSeconds: details.beaconIntervalSeconds,
    lastCheckinTime: details.lastCheckinTime,
    isActive: true,
    readOnlyACGs: details.readOnlyACGs,
    operatorACGs: details.operatorACGs,
  };
  const updated = await Implant.findOneAndUpdate(
    { id: details.id },
    updatedEntity
  );
  delete updated["_id"];
  sendMessage(entityTypes.IMPLANTS, eventTypes.EDIT, updated);
};

/**
 * @param {string} id Implant to find. NOT the database ID; this is assigned by the implant itself when beaconing.
 * @returns The implant (or null)
 */
const findImplantById = async (id) => {
  if (id) {
    return await Implant.findOne({ id: id });
  } else {
    return null;
  }
};

/**
 * @returns All the implant records that the user is permitted to view
 */
const getAllImplants = async () => {
  return await Implant.find();
};

const checkActivity = async () => {
  log("checkActivity", "Checking for inactive implants", levels.DEBUG);
  const numMissedBeaconsForInactive = 3; // How many beacons must the implant have missed in order to be deemed "inactive"
  const implants = await getAllImplants();
  implants.forEach(async (implant) => {
    const missedCheckins =
      (Date.now() / 1000 - implant.lastCheckinTime) /
      implant.beaconIntervalSeconds;
    if (missedCheckins > numMissedBeaconsForInactive) {
      implant.isActive = false;
      await implant.save();
      sendMessage(entityTypes.IMPLANTS, eventTypes.EDIT, implant);
    }
  });
};

/**
 * @param {String} id Implant to find. NOT the database ID; this is assigned by the implant itself when beaconing.
 */
const deleteImplant = async (implantId) => {
  log("deleteImplant", `Deleting implant ${implantId}`, levels.INFO);
  await Implant.findOneAndDelete({ id: implantId });
  sendMessage(entityTypes.IMPLANTS, eventTypes.DELETE, {
    id: implantId,
  });
};

const updateACGs = async (implantId, readOnlyACGs, operatorACGs) => {
  log("updateACGs", `Updating implant ${implantId}'s ACGs`, levels.INFO);
  const implant = await findImplantById(implantId);
  if (implant) {
    implant.readOnlyACGs = readOnlyACGs;
    implant.operatorACGs = operatorACGs;
    await implant.save();
  }
  return implant;
};

module.exports = {
  addImplant,
  updateImplant,
  findImplantById,
  getAllImplants,
  checkActivity,
  deleteImplant,
  updateACGs,
};

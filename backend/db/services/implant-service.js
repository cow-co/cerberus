const { sendMessage, entityTypes } = require("../../utils/web-sockets");
const Implant = require("../models/Implant");

// TODO Maybe we *should* have separate message types for create/edit/delete?
//  Otherwise, every single update method must also call getImplants

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
  await Implant.create({
    id: details.id,
    ip: details.ip,
    os: details.os,
    beaconIntervalSeconds: details.beaconIntervalSeconds,
    lastCheckinTime: details.lastCheckinTimeSeconds,
    isActive: true,
  });
  sendMessage({
    type: entityTypes.IMPLANTS,
    implants: await getAllImplants(),
  });
};

/**
 * @param {Implant} details The implant to update with
 */
const updateImplant = async (details) => {
  await Implant.findOneAndUpdate(
    { id: details.id },
    {
      id: details.id,
      ip: details.ip,
      os: details.os,
      beaconIntervalSeconds: details.beaconIntervalSeconds,
      lastCheckinTime: details.lastCheckinTimeSeconds,
      isActive: true,
    }
  );
  // TODO Send websocket message
};

/**
 * @param {string} id Implant to find. NOT the database ID; this is assigned by the implant itself when beaconing.
 * @returns The implant (or null)
 */
const findImplantById = async (id) => {
  let implant = null;
  if (id) {
    implant = await Implant.findOne({ id: id });
  }
  return implant;
};

/**
 * @returns All the implant records
 */
const getAllImplants = async () => {
  let implants = [];
  implants = await Implant.find();
  return implants;
};

const checkActivity = async () => {
  const numMissedBeaconsForInactive = 3; // How many beacons must the implant have missed in order to be deemed "inactive"
  const implants = await getAllImplants();
  implants.forEach(async (implant) => {
    const missedCheckins =
      (Date.now() - implant.lastCheckinTime) / implant.beaconIntervalSeconds;
    if (missedCheckins > numMissedBeaconsForInactive) {
      implant.isActive = false;
      await implant.save();
      // TODO Send websocket message
    }
  });
};

module.exports = {
  addImplant,
  updateImplant,
  findImplantById,
  getAllImplants,
  checkActivity,
};

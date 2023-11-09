const {
  sendMessage,
  entityTypes,
  eventTypes,
} = require("../../utils/web-sockets");
const Implant = require("../models/Implant");

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
  const entity = {
    id: details.id,
    ip: details.ip,
    os: details.os,
    beaconIntervalMS: details.beaconIntervalMS,
    lastCheckinTime: details.lastCheckinTime,
    isActive: true,
  };
  await Implant.create(entity);
  sendMessage(entityTypes.IMPLANTS, eventTypes.CREATE, entity);
};

/**
 * @param {Implant} details The implant to update with
 */
const updateImplant = async (details) => {
  const updatedEntity = {
    id: details.id,
    ip: details.ip,
    os: details.os,
    beaconIntervalMS: details.beaconIntervalMS,
    lastCheckinTime: details.lastCheckinTime,
    isActive: true,
  };
  await Implant.findOneAndUpdate({ id: details.id }, updatedEntity);
  sendMessage(entityTypes.IMPLANTS, eventTypes.EDIT, updatedEntity);
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
      (Date.now() - implant.lastCheckinTime) / implant.beaconIntervalMS;
    if (missedCheckins > numMissedBeaconsForInactive) {
      implant.isActive = false;
      await implant.save();
      sendMessage(entityTypes.IMPLANTS, eventTypes.EDIT, implant);
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

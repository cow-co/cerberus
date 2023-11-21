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
  await Implant.create(entity);
  sendMessage(entityTypes.IMPLANTS, eventTypes.CREATE, entity);
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
  };
  await Implant.findOneAndUpdate({ id: details.id }, updatedEntity);
  sendMessage(entityTypes.IMPLANTS, eventTypes.EDIT, updatedEntity);
};

// TODO Have a think about how the filtering will actually work (edit vs read, etc)
const filterImplants = (implants, userAcgs, userIsAdmin) => {
  let result = [];
  if (userIsAdmin) {
    result = implants;
  } else {
  }
  return result;
};

/**
 * @param {string} id Implant to find. NOT the database ID; this is assigned by the implant itself when beaconing.
 * @returns The implant (or null)
 */
// FIXME I'd like to not have to leak user info into this module - encapsulation issue
const findImplantById = async (userAcgs, userIsAdmin, id) => {
  let implant = null;
  if (id && userIsAdmin) {
    implant = await Implant.findOne({ id: id });
  } else if (id) {
    implant = await Implant.findOne({ id: id })
      .and()
      .or([
        {
          readOnlyACGs: { $in: userAcgs },
        },
        { operatorACGs: { $in: userAcgs } },
      ]);
  }
  return implant;
};

// TODO Do the filtering at the API layer, since we need to build in functionality for if the implant has no ACGs (all users can interact)

/**
 * @returns All the implant records that the user is permitted to view
 */
const getAllImplants = async (userAcgs, userIsAdmin) => {
  let implants = [];
  if (userIsAdmin) {
    implants = await Implant.find();
  } else {
    implants = await Implant.find().or([
      {
        readOnlyACGs: { $in: userAcgs },
      },
      { operatorACGs: { $in: userAcgs } },
    ]);
  }
  return implants;
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

module.exports = {
  addImplant,
  updateImplant,
  findImplantById,
  getAllImplants,
  checkActivity,
  deleteImplant,
};

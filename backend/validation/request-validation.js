const logger = require("../utils/logger");
const net = require("net");

const validateBeacon = (beacon) => {
  logger.log(
    "validateBeacon",
    `Validating beacon ${JSON.stringify(beacon)}`,
    logger.levels.DEBUG
  );

  let validity = {
    isValid: true,
    errors: [],
  };

  if (!beacon.id) {
    validity.isValid = false;
    validity.errors.push("Beacon must have an ID");
  }

  if (beacon.ip) {
    if (!net.isIP(beacon.ip)) {
      validity.isValid = false;
      validity.errors.push("Beacon IP Format Invalid");
    }
  }

  if (beacon.beaconIntervalSeconds === undefined) {
    validity.isValid = false;
    validity.errors.push("Beacon must specify an interval");
  } else if (beacon.beaconIntervalSeconds <= 0) {
    validity.isValid = false;
    validity.errors.push("Beacon interval must be strictly positive");
  }

  return validity;
};

const validateTask = (task) => {
  logger.log(
    "validateTask",
    `Validating task ${JSON.stringify(task)}`,
    logger.levels.DEBUG
  );

  let validity = {
    isValid: true,
    errors: [],
  };

  if (!task.type) {
    validity.isValid = false;
    validity.errors.push("Task must have a type");
  } else if (!task.type.id || !task.type.name) {
    validity.isValid = false;
    validity.errors.push("Task type must have an ID and name");
  }

  if (!task.implantId) {
    validity.isValid = false;
    validity.errors.push("Task must contain an implant ID");
  }

  return validity;
};

module.exports = {
  validateBeacon,
  validateTask,
};

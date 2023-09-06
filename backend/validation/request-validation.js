const logger = require("../utils/logger");

const validateBeacon = (beacon) => {
  // TODO Validate the following
  //  id is present and in correct format
  //  ip, if present, is in proper format
  //  beacon checkin interval is positive
  logger.log("validateBeacon", "Validating beacon...", logger.levels.DEBUG);
  let isValid = true;
  return isValid;
};

module.exports = {
  validateBeacon,
};

const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const logger = require("../utils/logger");
const { validateBeacon } = require("../validation/request-validation");

router.post("/", async (req, res) => {
  logger.log(
    "/beacon",
    `Received beacon: ${JSON.stringify(req.body)}`,
    logger.levels.DEBUG
  );
  let returnStatus = statusCodes.OK;
  let responseJSON = {}; // TODO make the response DTOs into their own classes
  if (validateBeacon(req.body)) {
    responseJSON = {
      message: "Success",
    };
  } else {
    responseJSON = {
      message: "Validation Error",
    };
    returnStatus = statusCodes.BAD_REQUEST;
  }
  return res.status(returnStatus).json(responseJSON);
});

module.exports = router;

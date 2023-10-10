const express = require("express");
const {
  getTasksForImplant,
  getTaskById,
  createTask,
  getTaskTypes,
  deleteTask,
} = require("../db/services/tasks-service");
const router = express.Router();
const logger = require("../utils/logger");
const statusCodes = require("../config/statusCodes");
const { validateTask } = require("../validation/request-validation");
const { verifySession } = require("../security/user-and-access-manager");
const ResponseDTO = require("../api/dto/ResponseDTO");

router.get("/tasks/:implantId", verifySession, async (req, res) => {
  logger.log(
    `/tasks/${req.params.implantId}`,
    "Getting tasks for implant...",
    logger.levels.DEBUG
  );
  let returnStatus = statusCodes.OK;
  let errors = [];
  let tasks = [];

  try {
    const includeSent = req.query.includeSent === "true";
    tasks = await getTasksForImplant(req.params.implantId, includeSent);
  } catch (err) {
    logger.log(`/tasks/${req.params.implantId}`, err, logger.levels.ERROR);
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    errors = ["Internal Server Error"];
  }

  const responseJSON = new ResponseDTO(tasks, errors);
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
  logger.log(
    "/tasks",
    `Creating task ${JSON.stringify(req.body)}`,
    logger.levels.DEBUG
  );
  let returnStatus = statusCodes.OK;
  let responseJSON = {};

  const validationResult = await validateTask(req.body);
  if (validationResult.isValid) {
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
  } else {
    returnStatus = statusCodes.BAD_REQUEST;
    responseJSON = {
      errors: validationResult.errors,
    };
  }

  return res.status(returnStatus).json(responseJSON);
});

router.delete("/tasks/:taskId", async (req, res) => {
  logger.log(
    `DELETE /tasks/${req.params.taskId}`,
    `Deleting task ${req.params.taskId}`,
    logger.levels.INFO
  );

  let responseJSON = {
    errors: [],
  };
  let returnStatus = statusCodes.OK;

  try {
    const task = await getTaskById(req.params.taskId);
    if (task === undefined || task === null) {
      returnStatus = statusCodes.BAD_REQUEST;
      responseJSON.errors.push(
        `Task with ID ${req.params.taskId} does not exist.`
      );
      logger.log(
        `DELETE /tasks/${req.params.taskId}`,
        "Task not found",
        logger.levels.ERROR
      );
    } else {
      if (task.sent) {
        returnStatus = statusCodes.BAD_REQUEST;
        responseJSON.errors.push(
          "Cannot delete a task that has been sent to an implant."
        );
        logger.log(
          `DELETE /tasks/${req.params.taskId}`,
          "Task already sent",
          logger.levels.ERROR
        );
      } else {
        await deleteTask(req.params.taskId);
      }
    }
  } catch (err) {
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    responseJSON.errors.push("Internal Server Error");
    logger.log(`DELETE /tasks/${req.params.taskId}`, err, logger.levels.ERROR);
  }

  return res.status(returnStatus).json(responseJSON);
});

module.exports = router;

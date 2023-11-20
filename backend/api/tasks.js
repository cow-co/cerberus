const express = require("express");
const tasksService = require("../db/services/tasks-service");
const router = express.Router();
const { levels, log } = require("../utils/logger");
const statusCodes = require("../config/statusCodes");
const {
  validateTask,
  validateTaskType,
} = require("../validation/request-validation");
const accessManager = require("../security/user-and-access-manager");

/**
 * `implantId` must be the one assigned by the implant itself, NOT the database key.
 * Requires user to be logged in.
 */
router.get("/tasks/:implantId", accessManager.verifyToken, async (req, res) => {
  const implantId = req.paramString("implantId");
  log(`GET /tasks/${implantId}`, "Getting tasks for implant...", levels.DEBUG);
  let returnStatus = statusCodes.OK;
  let responseJSON = {};

  try {
    const includeSent = req.query.includeSent === "true";
    const tasks = await tasksService.getTasksForImplant(implantId, includeSent);
    responseJSON = {
      tasks: tasks,
      errors: [],
    };
  } catch (err) {
    log(`GET /tasks/${implantId}`, err, levels.ERROR);
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    responseJSON = {
      tasks: [],
      errors: ["Internal Server Error"],
    };
  }

  return res.status(returnStatus).json(responseJSON);
});

router.get("/task-types", accessManager.verifyToken, async (req, res) => {
  log("GET /task-types", "Getting task types...", levels.DEBUG);
  let returnStatus = statusCodes.OK;
  let responseJSON = {};

  try {
    const taskTypes = await tasksService.getTaskTypes();
    responseJSON = {
      taskTypes: taskTypes,
      errors: [],
    };
  } catch (err) {
    log("GET /task-types", err, levels.ERROR);
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    responseJSON = {
      taskTypes: [],
      errors: ["Internal Server Error"],
    };
  }

  return res.status(returnStatus).json(responseJSON);
});

/**
 * Expects req.body to contain:
 * - `name` (string)
 * - `params` (array of *unique* strings)
 */
router.post(
  "/task-types",
  accessManager.verifyToken,
  accessManager.checkAdmin,
  async (req, res) => {
    log("POST /task-types", "Creating a task type...", levels.DEBUG);
    let response = {
      taskType: null,
      errors: [],
    };
    let status = statusCodes.OK;
    try {
      const validity = validateTaskType(req.body);
      if (validity.isValid) {
        response.taskType = await tasksService.createTaskType(req.body);
      } else {
        status = statusCodes.BAD_REQUEST;
        response.errors = validity.errors;
      }
    } catch (err) {
      log("POST /task-types", err, levels.ERROR);
      response.errors = ["Internal Server Error"];
      status = statusCodes.INTERNAL_SERVER_ERROR;
    }
    res.status(status).json(response);
  }
);

router.post("/tasks", accessManager.verifyToken, async (req, res) => {
  log("POST /tasks", `Setting task ${JSON.stringify(req.body)}`, levels.DEBUG);
  let returnStatus = statusCodes.OK;
  let responseJSON = { errors: [] };

  const validationResult = await validateTask(req.body);
  if (validationResult.isValid) {
    try {
      error = await tasksService.setTask(req.body);
      if (error) {
        log("POST /tasks", error, levels.WARN);
        returnStatus = statusCodes.BAD_REQUEST;
        responseJSON.errors = [error];
      }
    } catch (err) {
      log("POST /tasks", err, levels.ERROR);
      returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
      responseJSON = {
        errors: ["Internal Server Error"],
      };
    }
  } else {
    returnStatus = statusCodes.BAD_REQUEST;
    responseJSON.errors = validationResult.errors;
  }

  return res.status(returnStatus).json(responseJSON);
});

router.delete("/tasks/:taskId", accessManager.verifyToken, async (req, res) => {
  const taskId = req.paramString("taskId");
  log(`DELETE /tasks/${taskId}`, `Deleting task ${taskId}`, levels.INFO);

  let responseJSON = {
    errors: [],
  };
  let returnStatus = statusCodes.OK;

  try {
    const task = await tasksService.getTaskById(taskId);
    if (task) {
      if (task.sent) {
        returnStatus = statusCodes.BAD_REQUEST;
        responseJSON.errors.push(
          "Cannot delete a task that has been sent to an implant."
        );
        log(`DELETE /tasks/${taskId}`, "Task already sent", levels.WARN);
      } else {
        await tasksService.deleteTask(taskId);
      }
    } else {
      log(
        `DELETE /tasks/${taskId}`,
        `Task with ID ${taskId} does not exist`,
        levels.WARN
      );
    }
  } catch (err) {
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    responseJSON.errors.push("Internal Server Error");
    log(`DELETE /tasks/${taskId}`, err, levels.ERROR);
  }

  return res.status(returnStatus).json(responseJSON);
});

router.delete(
  "/task-types/:taskTypeId",
  accessManager.verifyToken,
  accessManager.checkAdmin,
  async (req, res) => {
    const taskTypeId = req.paramString("taskTypeId");
    log(
      `DELETE /task-types/${taskTypeId}`,
      `Deleting task type ${taskTypeId}`,
      levels.INFO
    );

    let responseJSON = {
      errors: [],
    };
    let returnStatus = statusCodes.OK;

    try {
      const taskType = await tasksService.getTaskTypeById(taskTypeId);
      if (taskType) {
        await tasksService.deleteTaskType(taskTypeId);
      } else {
        log(
          `DELETE /task-types/${taskTypeId}`,
          `Task type with ID ${taskTypeId} does not exist`,
          levels.WARN
        );
      }
    } catch (err) {
      returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
      responseJSON.errors.push("Internal Server Error");
      log(`DELETE /task-types/${taskTypeId}`, err, levels.ERROR);
    }

    return res.status(returnStatus).json(responseJSON);
  }
);

router.get("/task-types/param-data-types", (req, res) => {
  log(
    `GET /task-types/param-data-types`,
    "Getting param data types...",
    levels.DEBUG
  );
  let response = {};
  let statusCode = statusCodes.OK;
  response.dataTypes = tasksService.getParamDataTypes();

  return res.status(statusCode).json(response);
});

module.exports = router;

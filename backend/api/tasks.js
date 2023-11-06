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
router.get(
  "/tasks/:implantId",
  accessManager.verifySession,
  async (req, res) => {
    log(
      `/tasks/${req.params.implantId}`,
      "Getting tasks for implant...",
      levels.DEBUG
    );
    let returnStatus = statusCodes.OK;
    let responseJSON = {};

    try {
      const includeSent = req.query.includeSent === "true";
      const tasks = await tasksService.getTasksForImplant(
        req.params.implantId,
        includeSent
      );
      responseJSON = {
        tasks: tasks,
        errors: [],
      };
    } catch (err) {
      log(`/tasks/${req.params.implantId}`, err, levels.ERROR);
      returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
      responseJSON = {
        tasks: [],
        errors: ["Internal Server Error"],
      };
    }

    return res.status(returnStatus).json(responseJSON);
  }
);

router.get("/task-types", accessManager.verifySession, async (req, res) => {
  log("/task-types", "Getting task types...", levels.DEBUG);
  let returnStatus = statusCodes.OK;
  let responseJSON = {};

  try {
    const taskTypes = await tasksService.getTaskTypes();
    responseJSON = {
      taskTypes: taskTypes,
      errors: [],
    };
  } catch (err) {
    log("/task-types", err, levels.ERROR);
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
  accessManager.verifySession,
  accessManager.checkAdmin,
  async (req, res) => {
    log("/task-types", "Creating a task type...", levels.DEBUG);
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
      log("/task-types", err, levels.ERROR);
      response.errors = ["Internal Server Error"];
      status = statusCodes.INTERNAL_SERVER_ERROR;
    }
    res.status(status).json(response);
  }
);

router.post("/tasks", accessManager.verifySession, async (req, res) => {
  log("POST /tasks", `Setting task ${JSON.stringify(req.body)}`, levels.DEBUG);
  let returnStatus = statusCodes.OK;
  let responseJSON = { errors: [] };

  const validationResult = await validateTask(req.body);
  if (validationResult.isValid) {
    try {
      error = await tasksService.setTask(req.body);
      if (error) {
        console.log(error);
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

router.delete(
  "/tasks/:taskId",
  accessManager.verifySession,
  async (req, res) => {
    log(
      `DELETE /tasks/${req.params.taskId}`,
      `Deleting task ${req.params.taskId}`,
      levels.INFO
    );

    let responseJSON = {
      errors: [],
    };
    let returnStatus = statusCodes.OK;

    try {
      const task = await tasksService.getTaskById(req.params.taskId);
      if (task) {
        if (task.sent) {
          returnStatus = statusCodes.BAD_REQUEST;
          responseJSON.errors.push(
            "Cannot delete a task that has been sent to an implant."
          );
          log(
            `DELETE /tasks/${req.params.taskId}`,
            "Task already sent",
            levels.ERROR
          );
        } else {
          await tasksService.deleteTask(req.params.taskId);
        }
      } else {
        log(
          `DELETE /tasks/${req.params.taskId}`,
          `Task with ID ${req.params.taskId} does not exist`,
          levels.WARN
        );
      }
    } catch (err) {
      returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
      responseJSON.errors.push("Internal Server Error");
      log(`DELETE /tasks/${req.params.taskId}`, err, levels.ERROR);
    }

    return res.status(returnStatus).json(responseJSON);
  }
);

router.delete(
  "/task-types/:taskTypeId",
  accessManager.verifySession,
  accessManager.checkAdmin,
  async (req, res) => {
    log(
      `DELETE /task-types/${req.params.taskTypeId}`,
      `Deleting task type ${req.params.taskTypeId}`,
      levels.INFO
    );

    let responseJSON = {
      errors: [],
    };
    let returnStatus = statusCodes.OK;

    try {
      const taskType = await tasksService.getTaskTypeById(
        req.params.taskTypeId
      );
      if (taskType) {
        await tasksService.deleteTaskType(req.params.taskTypeId);
      } else {
        log(
          `DELETE /task-types/${req.params.taskTypeId}`,
          `Task type with ID ${req.params.taskTypeId} does not exist`,
          levels.WARN
        );
      }
    } catch (err) {
      returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
      responseJSON.errors.push("Internal Server Error");
      log(`DELETE /task-types/${req.params.taskTypeId}`, err, levels.ERROR);
    }

    return res.status(returnStatus).json(responseJSON);
  }
);

router.get("/task-types/param-data-types", (req, res) => {
  let response = {};
  let statusCode = statusCodes.OK;
  response.dataTypes = tasksService.getParamDataTypes();

  return res.status(statusCode).json(response);
});

module.exports = router;

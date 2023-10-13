const express = require("express");
const {
  getTasksForImplant,
  getTaskById,
  createTask,
  getTaskTypes,
  deleteTask,
  createTaskType,
  getTaskTypeById,
} = require("../db/services/tasks-service");
const router = express.Router();
const { levels, log } = require("../utils/logger");
const statusCodes = require("../config/statusCodes");
const {
  validateTask,
  validateTaskType,
} = require("../validation/request-validation");
const {
  verifySession,
  checkAdmin,
} = require("../security/user-and-access-manager");
const { deleteTaskType } = require("../../frontend/src/functions/apiCalls");

/**
 * `implantId` must be the one assigned by the implant itself, NOT the database key.
 * Requires user to be logged in.
 */
router.get("/tasks/:implantId", verifySession, async (req, res) => {
  log(
    `/tasks/${req.params.implantId}`,
    "Getting tasks for implant...",
    levels.DEBUG
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
    log(`/tasks/${req.params.implantId}`, err, levels.ERROR);
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    responseJSON = {
      tasks: [],
      errors: ["Internal Server Error"],
    };
  }

  return res.status(returnStatus).json(responseJSON);
});

router.get("/task-types", verifySession, async (req, res) => {
  log("/task-types", "Getting task types...", levels.DEBUG);
  let returnStatus = statusCodes.OK;
  let responseJSON = {};

  try {
    const taskTypes = await getTaskTypes();
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
router.post("/task-types", verifySession, checkAdmin, async (req, res) => {
  log("/task-types", "Creating a task type...", levels.DEBUG);
  let response = {
    taskType: null,
    errors: [],
  };
  let status = statusCodes.OK;
  try {
    const validity = validateTaskType(req.body);
    if (validity.isValid) {
      response.taskType = await createTaskType(req.body);
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
});

router.post("/tasks", verifySession, async (req, res) => {
  log("/tasks", `Creating task ${JSON.stringify(req.body)}`, levels.DEBUG);
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
      log("/tasks", err, levels.ERROR);
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

router.delete("/tasks/:taskId", verifySession, async (req, res) => {
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
    const task = await getTaskById(req.params.taskId);
    if (task === undefined || task === null) {
      returnStatus = statusCodes.BAD_REQUEST;
      responseJSON.errors.push(
        `Task with ID ${req.params.taskId} does not exist.`
      );
      log(`DELETE /tasks/${req.params.taskId}`, "Task not found", levels.ERROR);
    } else {
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
        await deleteTask(req.params.taskId);
      }
    }
  } catch (err) {
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    responseJSON.errors.push("Internal Server Error");
    log(`DELETE /tasks/${req.params.taskId}`, err, levels.ERROR);
  }

  return res.status(returnStatus).json(responseJSON);
});

router.delete(
  "/tasks-types/:taskTypeId",
  verifySession,
  checkAdmin,
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
      const taskType = await getTaskTypeById(req.params.taskTypeId);
      if (!taskType) {
        returnStatus = statusCodes.BAD_REQUEST;
        responseJSON.errors.push(
          `Task with ID ${req.params.taskTypeId} does not exist.`
        );
        log(
          `DELETE /tasks/${req.params.taskTypeId}`,
          "Task not found",
          levels.ERROR
        );
      } else {
        await deleteTaskType(req.params.taskTypeId);
      }
    } catch (err) {
      returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
      responseJSON.errors.push("Internal Server Error");
      log(`DELETE /task-types/${req.params.taskTypeId}`, err, levels.ERROR);
    }

    return res.status(returnStatus).json(responseJSON);
  }
);

module.exports = router;

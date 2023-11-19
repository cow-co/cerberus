const {
  entityTypes,
  eventTypes,
  sendMessage,
} = require("../../utils/web-sockets");
const Task = require("../models/Task");
const TaskType = require("../models/TaskType");
const { log, levels } = require("../../utils/logger");

/**
 * @typedef {object} TaskType
 * @property {string | undefined} id
 * @property {string} name
 * @property {Array<string>} params
 *
 * @typedef {object} ParamValue
 * @property {string} name
 * @property {string} value
 *
 * @typedef {object} Task
 * @property {number} order
 * @property {string} implantId
 * @property {TaskType} type
 * @property {Array<ParamValue>} params
 */

/**
 *
 * @param {string} implantId
 * @param {boolean} history Include already-sent tasks
 * @returns The tasks, possibly filtered by sent-status
 */
const getTasksForImplant = async (implantId, history) => {
  let tasks = [];
  if (history) {
    tasks = await Task.find({
      implantId: implantId,
    }).sort({ order: -1 });
  } else {
    tasks = await Task.find({
      implantId: implantId,
      sent: false,
    }).sort({ order: -1 });
  }
  return tasks;
};

/**
 *
 * @param {string} taskId
 * @returns
 */
const getTaskById = async (taskId) => {
  let task = null;
  if (taskId) {
    task = await Task.findById(taskId);
  }
  return task;
};

const getTaskTypes = async () => {
  const taskTypes = await TaskType.find();
  return taskTypes;
};

/**
 * @param {string} id
 * @returns
 */
const getTaskTypeById = async (id) => {
  let taskType = null;
  if (id) {
    taskType = await TaskType.findById(id);
  }
  return taskType;
};

/**
 *
 * @param {string} mongoId
 */
const taskSent = async (mongoId) => {
  log("taskSent", `Setting task ${mongoId} to sent`, levels.DEBUG);
  if (mongoId) {
    const updated = await Task.findByIdAndUpdate(
      mongoId,
      {
        sent: true,
      },
      { new: true }
    );
    sendMessage(entityTypes.TASKS, eventTypes.EDIT, updated);
  }
};

const setTask = async (task) => {
  log("setTask", "Creating or updating task", levels.DEBUG);
  let error = null;

  const existing = await getTaskById(task._id);
  if (task._id && existing) {
    if (existing.sent) {
      error = "Cannot edit a task that has already been sent";
    } else {
      const updated = await existing.updateOne(task, { new: true });
      sendMessage(entityTypes.TASKS, eventTypes.EDIT, updated);
    }
  } else {
    // We don't check that the implant actually exists, since there may be cases where we might
    // want to line up tasks before an implant is deployed. We don't want to make that *easy* (via UI), necessarily,
    // but we do want to make it possible
    const tasksList = await getTasksForImplant(task.implantId, true);
    let order = 0;

    // getTasksForImplant returns the list sorted by order value
    if (tasksList.length > 0) {
      order = tasksList[0].order + 1;
    }

    const result = await Task.create({
      order: order,
      implantId: task.implantId,
      taskType: task.taskType,
      params: task.params,
      sent: false,
    });
    sendMessage(entityTypes.TASKS, eventTypes.CREATE, result);
  }

  return error;
};

/**
 *
 * @param {TaskType} taskType
 * @returns
 */
const createTaskType = async (taskType) => {
  log("createTaskType", "Creating task type", levels.DEBUG);
  const created = await TaskType.create({
    name: taskType.name,
    params: taskType.params,
  });
  sendMessage(entityTypes.TASK_TYPES, eventTypes.CREATE, created);
  return created;
};

/**
 * @param {string} taskId
 */
const deleteTask = async (taskId) => {
  log("deleteTask", `Deleting task ${taskId}`, levels.INFO);
  await Task.findByIdAndDelete(taskId);
  sendMessage(entityTypes.TASKS, eventTypes.DELETE, { _id: taskId });
};

/**
 * @param {string} taskTypeId
 */
const deleteTaskType = async (taskTypeId) => {
  log("deleteTaskType", `Deleting task type ${taskTypeId}`, levels.INFO);
  await TaskType.findByIdAndDelete(taskTypeId);
  sendMessage(entityTypes.TASK_TYPES, eventTypes.DELETE, { _id: taskTypeId });
};

const getParamDataTypes = () => {
  return TaskType.schema.path("params.type").enumValues;
};

module.exports = {
  getTasksForImplant,
  getTaskById,
  taskSent,
  setTask,
  getTaskTypes,
  getTaskTypeById,
  createTaskType,
  deleteTask,
  deleteTaskType,
  getParamDataTypes,
};

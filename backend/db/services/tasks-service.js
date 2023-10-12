const Task = require("../models/Task");
const TaskType = require("../models/TaskType");

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
  return await Task.findById(taskId);
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
  const taskType = await TaskType.findById(id);
  return taskType;
};

/**
 *
 * @param {string} mongoId
 */
const taskSent = async (mongoId) => {
  await Task.findByIdAndUpdate(mongoId, {
    sent: true,
  });
};

/**
 * @param {Task} task
 * @returns
 */
const createTask = async (task) => {
  const existing = await getTasksForImplant(task.implantId, true);
  let order = 0;

  // getTasksForImplant returns the list sorted by order value
  if (existing.length > 0) {
    order = existing[0].order + 1;
  }

  await Task.create({
    order: order,
    implantId: task.implantId,
    taskType: task.type.name,
    params: task.params,
    sent: false,
  });
};

/**
 *
 * @param {TaskType} taskType
 * @returns
 */
const createTaskType = async (taskType) => {
  const created = await TaskType.create({
    name: taskType.name,
    params: taskType.params,
  });
  return created;
};

/**
 *
 * @param {string} taskId
 */
const deleteTask = async (taskId) => {
  await Task.findByIdAndDelete(taskId);
};

module.exports = {
  getTasksForImplant,
  getTaskById,
  taskSent,
  createTask,
  getTaskTypes,
  getTaskTypeById,
  createTaskType,
  deleteTask,
};

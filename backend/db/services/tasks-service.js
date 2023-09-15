const Task = require("../models/Task");
const TaskType = require("../models/TaskType");

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

const getTaskTypes = async () => {
  const taskTypes = await TaskType.find();
  return taskTypes;
};

const taskSent = async (mongoId) => {
  await Task.findByIdAndUpdate(mongoId, {
    sent: true,
  });
};

const createTask = async (task) => {
  // TODO should we validate that the task type actually exists? or should we leave that as a client-responsibility?
  //  Will an invalid task type cause security issues or anything major like that?
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

const createTaskType = async (taskType) => {
  await TaskType.create({
    name: taskType.name,
    params: taskType.params,
  });
};

module.exports = {
  getTasksForImplant,
  taskSent,
  createTask,
  getTaskTypes,
  createTaskType,
};

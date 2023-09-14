const Task = require("../models/Task");
const TaskType = require("../models/TaskType");

const getTasksForImplant = async (implantId, history) => {
  let tasks = [];
  if (history) {
    tasks = await Task.find({
      implantId: implantId,
    });
  } else {
    tasks = await Task.find({
      implantId: implantId,
      sent: false,
    });
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
  await Task.create({
    order: task.order,
    implantId: task.implantId,
    taskType: task.type,
    params: task.params,
    sent: false,
  });
};

const createTaskType = async (taskType) => {
  // TODO De-duplicate by validating that names are unique
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

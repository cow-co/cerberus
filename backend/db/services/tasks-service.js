const Task = require("../models/Task");

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

module.exports = {
  getTasksForImplant,
  taskSent,
  createTask,
};

const Task = require("../models/Task");

const getTasksForImplant = async (implantId, history) => {
  const tasks = await Task.find({
    implantId: implantId,
    sent: history,
  });
  return tasks;
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
  createTask,
};

const Task = require("../models/Task");

const getTasksForImplant = async (implantId, history) => {
  const tasks = await Task.find({
    implantId: implantId,
    sent: history,
  });
  return tasks;
};

module.exports = {
  getTasksForImplant,
};

const Task = require("../models/Task");

const getCurrentTasksForImplant = async (implantId) => {
  const tasks = await Task.find({
    implantId: implantId,
    sent: false,
  });
  return tasks;
};

module.exports = {
  getCurrentTasksForImplant,
};

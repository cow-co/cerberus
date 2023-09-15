const {
  getNumDbVersions,
  updateDBVersion,
} = require("./services/db-state-service");
const { createTaskType, getTaskTypes } = require("./services/tasks-service");

const seedTaskTypes = async () => {
  const defaultTaskTypes = [
    {
      name: "Set Beacon Interval",
      params: ["New Interval"],
    },
    {
      name: "Download",
      params: ["Source", "Destination"],
    },
    {
      name: "Run Command",
      params: ["Command"],
    },
  ];

  const numDbVersions = await getNumDbVersions();
  if (numDbVersions === 0) {
    defaultTaskTypes.forEach(
      async (taskType) => await createTaskType(taskType)
    );
    await updateDBVersion();
  }
};

module.exports = {
  seedTaskTypes,
};

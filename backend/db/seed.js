import { createTaskType } from "./services/tasks-service";

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

  defaultTaskTypes.forEach(async (taskType) => await createTaskType(taskType));
};

module.exports = {
  seedTaskTypes,
};

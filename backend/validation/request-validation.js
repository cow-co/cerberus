const { levels, log } = require("../utils/logger");
const net = require("net");
const tasksService = require("../db/services/tasks-service");

/**
 * @param {beacon} beacon
 * @returns Validity status (isValid and errors)
 */
const validateBeacon = (beacon) => {
  log("validateBeacon", "Validating beacon", levels.DEBUG);

  let validity = {
    isValid: true,
    errors: [],
  };

  if (!beacon.id) {
    validity.isValid = false;
    validity.errors.push("Beacon must have an ID");
  }

  if (beacon.ip) {
    if (!net.isIP(beacon.ip)) {
      validity.isValid = false;
      validity.errors.push("Beacon IP Format Invalid");
    }
  }

  if (beacon.beaconIntervalSeconds === undefined) {
    validity.isValid = false;
    validity.errors.push("Beacon must specify an interval");
  } else if (beacon.beaconIntervalSeconds <= 0) {
    validity.isValid = false;
    validity.errors.push("Beacon interval must be strictly positive");
  }

  return validity;
};

/**
 * @param {Task} task
 * @returns Validity status (isValid and errors)
 */
const validateTask = async (task) => {
  log("validateTask", "Validating task", levels.DEBUG);

  let validity = {
    isValid: true,
    errors: [],
  };

  if (!task.taskType) {
    validity.isValid = false;
    validity.errors.push("Task must have a type");
  } else if (!task.taskType.id || !task.taskType.name) {
    validity.isValid = false;
    validity.errors.push("Task type must have an ID and name");
  } else {
    const taskType = await tasksService.getTaskTypeById(task.taskType.id);
    if (taskType === undefined || taskType === null) {
      validity.isValid = false;
      validity.errors.push("Invalid task type");
    } else if (taskType.params.length !== task.params.length) {
      validity.isValid = false;
      validity.errors.push("Task must populate all available parameters");
    } else {
      const paramErrors = validateTaskParams(task, taskType);
      if (paramErrors.length !== 0) {
        validity.isValid = false;
        validity.errors = validity.errors.concat(paramErrors);
      }
    }
  }

  if (!task.implantId) {
    validity.isValid = false;
    validity.errors.push("Task must contain an implant ID");
  }

  return validity;
};

/**
 * @param {TaskType} taskType
 * @returns Validity status (isValid and errors)
 */
const validateTaskType = (taskType) => {
  log("validateTaskType", "Validating task type", levels.DEBUG);
  let validity = {
    isValid: true,
    errors: [],
  };
  if (!taskType.name || taskType.params === undefined) {
    validity.isValid = false;
    validity.errors = [
      "Task Type must have a name and an array (can be empty) of params",
    ];
  } else {
    const distinctParams = new Set(taskType.params);
    if (distinctParams.size !== taskType.params.length) {
      validity.isValid = false;
      validity.errors = ["Task Type params must be distinct"];
    }
  }
  return validity;
};

const isNum = (value) => {
  let isNumber = typeof value === "number";
  if (!isNumber) {
    isNumber = !isNaN(value) && !isNaN(parseFloat(value));
  }
  return isNumber;
};

const validateTaskParams = (task, taskType) => {
  let errors = [];

  task.params.forEach((param) => {
    const paramSpec = taskType.params.find(
      (paramSpec) => paramSpec.name === param.name
    );

    let valid = false;
    switch (paramSpec.type) {
      case "NUMBER":
        valid = isNum(param.value);
        break;
      case "STRING":
        valid = typeof param.value === "string";
        break;
    }

    if (!valid) {
      errors.push(
        `Parameter ${param.name} invalid - data type expected to be ${paramSpec.type}`
      );
    }
  });

  return errors;
};

module.exports = {
  validateBeacon,
  validateTask,
  validateTaskType,
};

const chalk = require("chalk");

const levels = {
  INFO: "INFO",
  DEBUG: "DEBUG",
  ERROR: "ERROR",
  WARN: "WARN",
};

const log = (location, message, level) => {
  message = `[${level}] ${location} ${message}`;
  switch (level) {
    case levels.INFO:
      console.info(chalk.green(message));
      break;
    case levels.DEBUG:
      console.debug(chalk.blue(message));
      break;
    case levels.ERROR:
      console.error(chalk.red(message));
      break;
    case levels.WARN:
      console.warn(chalk.yellow(message));
      break;

    default:
      console.info(chalk.green(message));
      break;
  }
};

module.exports = {
  levels,
  log,
};

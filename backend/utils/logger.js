const chalk = require("chalk");

const levels = {
  INFO: "INFO",
  DEBUG: "DEBUG",
  ERROR: "ERROR",
  WARN: "WARN",
};

/**
 *
 * @param {string} location Where the log event is occurring
 * @param {object} message The object to log, usually a string or exception
 * @param {'INFO' | 'DEBUG' | 'ERROR' | 'WARN'} level The log level
 */
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

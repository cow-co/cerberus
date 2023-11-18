const chalk = require("chalk");
const config = require("../config/general.json");

const levels = {
  DEBUG: {
    ord: 0,
    value: "DEBUG",
  },
  INFO: {
    ord: 1,
    value: "INFO",
  },
  WARN: {
    ord: 2,
    value: "WARN",
  },
  ERROR: {
    ord: 3,
    value: "ERROR",
  },
  FATAL: {
    ord: 4,
    value: "FATAL",
  },
  SECURITY: {
    ord: 5,
    value: "SECURITY",
  },
};

/**
 *
 * @typedef {object} LogLevel
 * @property {0 | 1 | 2 | 3 | 4 | 5} ord
 * @property {'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'SECURITY'} value
 * @param {string} location Where the log event is occurring
 * @param {object} message The object to log, usually a string or exception
 * @param {LogLevel} level The log level
 */
const log = (location, message, level) => {
  message = `[${level.value}] ${location} ${message}`;
  if (level.ord === levels.SECURITY.ord) {
    console.warn(chalk.yellow(message));
  } else if (level.ord >= levels[config["log-level"]].ord) {
    switch (level) {
      case levels.DEBUG:
        console.debug(chalk.blue(message));
        break;
      case levels.INFO:
        console.info(chalk.green(message));
        break;
      case levels.WARN:
        console.warn(chalk.yellow(message));
        break;
      case levels.ERROR:
        console.error(chalk.red(message));
        break;
      case levels.FATAL:
        console.warn(chalk.red(message));
        break;
      default:
        console.log(message);
        break;
    }
  }
};

module.exports = {
  levels,
  log,
};

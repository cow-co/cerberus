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
      console.info(message);
      break;
    case levels.DEBUG:
      console.debug(message);
      break;
    case levels.ERROR:
      console.error(message);
      break;
    case levels.WARN:
      console.warn(message);
      break;

    default:
      console.info(message);
      break;
  }
};

module.exports = {
  levels,
  log,
};

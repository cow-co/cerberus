const chalk = require("chalk");
const logging = require("../../utils/logger");
jest.mock("chalk", () => {
  return {
    blue: jest.fn((message) => {
      return message;
    }),
    green: jest.fn((message) => {
      return message;
    }),
    yellow: jest.fn((message) => {
      return message;
    }),
    red: jest.fn((message) => {
      return message;
    }),
  };
});

describe("Logger tests", () => {
  test("Logging - Info level, debug log", () => {
    logging.log("Test", "Test", logging.levels.DEBUG);

    expect(chalk.blue).toHaveBeenCalledTimes(0);
  });

  test("Logging - Info level, info log", () => {
    logging.log("Test", "Test", logging.levels.INFO);

    expect(chalk.green).toHaveBeenCalledTimes(1);
  });

  test("Logging - Info level, warn log", () => {
    logging.log("Test", "Test", logging.levels.WARN);

    expect(chalk.yellow).toHaveBeenCalledTimes(1);
  });

  test("Logging - Info level, error log", () => {
    logging.log("Test", "Test", logging.levels.ERROR);

    expect(chalk.red).toHaveBeenCalledTimes(1);
  });

  test("Logging - Info level, fatal log", () => {
    logging.log("Test", "Test", logging.levels.FATAL);

    expect(chalk.red).toHaveBeenCalledTimes(1);
  });

  test("Logging - Info level, fake log level", () => {
    logging.log("Test", "Test", {
      ord: 7,
      value: "FAKE",
    });

    expect(chalk.red).toHaveBeenCalledTimes(0);
    expect(chalk.yellow).toHaveBeenCalledTimes(0);
    expect(chalk.green).toHaveBeenCalledTimes(0);
    expect(chalk.blue).toHaveBeenCalledTimes(0);
  });

  test("Logging - Security log (regardless of configured level)", () => {
    logging.levels.SECURITY = {
      ord: -1,
      value: "SECURITY",
    };
    logging.log("Test", "Test", logging.levels.SECURITY);

    expect(chalk.yellow).toHaveBeenCalledTimes(1);
  });
});

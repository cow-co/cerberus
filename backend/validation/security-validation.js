const { levels, log } = require("../utils/logger");

const DIGITS_REGEX = /[0-9]+/g;
const MAX_USERNAME_LENGTH = 64;
const USERNAME_REGEX = /[0-9a-zA-Z_-]+/g;

/**
 * @param {string} password
 * @returns errors
 */
const validatePassword = (password, pwReqs) => {
  log("validatePassword", "Validating password", levels.DEBUG);
  let errors = [];

  if (pwReqs.requireUppercase && password.toLowerCase() === password) {
    errors.push("At least one uppercase character is required");
  }

  if (pwReqs.requireLowercase && password.toUpperCase() === password) {
    errors.push("At least one lowercase character is required");
  }

  if (pwReqs.requireNumber && password.match(DIGITS_REGEX) === null) {
    errors.push("At least one numeric digit is required");
  }

  if (password.length < pwReqs.minLength) {
    errors.push(`The password must be at least ${pwReqs.minLength} characters`);
  }

  return errors;
};

/**
 * @param {string} username
 * @returns The array of errors. Empty if username passes validation.
 */
const validateUsername = (username) => {
  log("validateUsername", "Validating username", levels.DEBUG);
  let errors = [];

  if (username.length > MAX_USERNAME_LENGTH) {
    errors.push(`Username must be of length <= ${MAX_USERNAME_LENGTH}`);
  }

  const matched = username.match(USERNAME_REGEX);
  if (matched === null || matched[0].length < username.length) {
    errors.push(
      "Username must only contain Latin characters, digits, hyphens, and underscores."
    );
  }

  return errors;
};

module.exports = {
  validatePassword,
  validateUsername,
};

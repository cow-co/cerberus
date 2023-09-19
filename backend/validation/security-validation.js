const { passwordRequirements } = require("../config/security-config");

const DIGITS_REGEX = "[0-9]+";

const validatePassword = (password) => {
  let errors = [];

  if (
    passwordRequirements.requireUppercase &&
    password.toLowerCase() === password
  ) {
    errors.push("At least one uppercase character is required");
  }

  if (
    passwordRequirements.requireLowercase &&
    password.toUpperCase() === password
  ) {
    errors.push("At least one lowercase character is required");
  }

  if (
    passwordRequirements.requireNumber &&
    password.matches(DIGITS_REGEX).length === 0
  ) {
    errors.push("At least one numeric digit is required");
  }

  if (password.length < passwordRequirements.minLength) {
    errors.push(
      `The password must be at least ${passwordRequirements.minLength} characters`
    );
  }

  return errors;
};

module.exports = {
  validatePassword,
};

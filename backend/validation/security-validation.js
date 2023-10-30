const DIGITS_REGEX = /[0-9]+/g;

/**
 * @param {string} password
 * @returns errors
 */
const validatePassword = (password, pwReqs) => {
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

module.exports = {
  validatePassword,
};

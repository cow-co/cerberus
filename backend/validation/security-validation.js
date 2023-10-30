const securityConfig = require("../config/security-config");

const DIGITS_REGEX = /[0-9]+/g;

/**
 * @param {string} password
 * @returns errors
 */
// TODO Perhaps pass the config in as a parameter? Then the calling code would have control of  what rules to use.
//  I could see that making this a bit more reusable in other codebases (could even use it to make admin pw reqs tougher than regular users?)
const validatePassword = (password) => {
  let errors = [];
  console.log(JSON.stringify(securityConfig));

  if (
    securityConfig.passwordRequirements.requireUppercase &&
    password.toLowerCase() === password
  ) {
    errors.push("At least one uppercase character is required");
  }

  if (
    securityConfig.passwordRequirements.requireLowercase &&
    password.toUpperCase() === password
  ) {
    errors.push("At least one lowercase character is required");
  }

  if (
    securityConfig.passwordRequirements.requireNumber &&
    password.match(DIGITS_REGEX) === null
  ) {
    errors.push("At least one numeric digit is required");
  }

  if (password.length < securityConfig.passwordRequirements.minLength) {
    errors.push(
      `The password must be at least ${securityConfig.passwordRequirements.minLength} characters`
    );
  }

  return errors;
};

module.exports = {
  validatePassword,
};

const validateSecurityConfig = (securityConfig) => {
  let isValid = true;
  let errors = [];

  if (!securityConfig.jwtSecret) {
    isValid = false;
    errors.push("Please set a JWT secret!");
  }

  if (!securityConfig.passwordRequirements) {
    isValid = false;
    errors.push("Please specify password requirements!");
  }

  if (
    !securityConfig.initialAdmin.username ||
    !securityConfig.initialAdmin.username
  ) {
    isValid = false;
    errors.push("Please configure an initial admin!");
  }

  return {
    isValid,
    errors,
  };
};

module.exports = {
  validateSecurityConfig,
};

module.exports = {
  // If true, then mutual TLS will be enforced. The DN from the client cert
  // will be used instead of a username/password (the login functionality will simply be pass-through)
  usePKI: false,
  jwtSecret: process.env.CERBERUS_JWT_SECRET || "FORGOODNESSSAKECHANGEME",
  passwordRequirements: {
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    minLength: 15,
  },
  initialAdmin: {
    username: process.env.CERBERUS_INIT_ADMIN_USER || "GenericAdmin",
    password:
      process.env.CERBERUS_INIT_ADMIN_PASS || "CHANGEMETOOFORCRYINGINTHESINK",
  },
  certType: "PFX",
  certFile: "../powershellcert.pfx",
  certPassword: process.env.CERB_CERT_PW || "CHANGETHISONETOO",
  keyFile: "./cerberus-key.pem",
  rateLimit: {
    windowTimeMS: 15 * 60 * 1000, // The timespan over which the rate is taken
    maxRequestsInWindow: 100, // How many requests can each IP make, per window
  },
};

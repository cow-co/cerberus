const { levels, log } = require("../utils/logger");

// TODO When registering, with PKI supported, make it pull username from CN, rather than using the user's provided name

/**
 * Checks that the certificate is valid, and grabs the CN from it.
 * @param {import("express").Request} req The HTTP request
 * @returns The CN of the certificate subject
 */
const extractUserDetails = (req) => {
  log(
    "extractUserDetails",
    "Extracting user details from client certificate",
    levels.DEBUG
  );
  const clientCert = req.socket.getPeerCertificate();
  let username = null;

  if (req.client.authorized) {
    username = clientCert.subject.CN;
  } else {
    log(
      "extractUserDetails",
      "PKI Certificate Authentication Failed - Cert rejected",
      levels.WARN
    );
  }

  return username;
};

module.exports = {
  extractUserDetails,
};

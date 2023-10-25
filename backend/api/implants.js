const express = require("express");
const router = express.Router();
const implantService = require("../db/services/implant-service");
const statusCodes = require("../config/statusCodes");
const accessManager = require("../security/user-and-access-manager");
const { log, levels } = require("../utils/logger");

router.get("", accessManager.verifySession, async (req, res) => {
  let responseJSON = {
    implants: null,
    errors: [],
  };
  let status = statusCodes.OK;
  try {
    responseJSON.implants = await implantService.getAllImplants();
  } catch (err) {
    log("implants/", err, levels.ERROR);
    responseJSON.errors = ["Internal Server Error"];
    status = statusCodes.INTERNAL_SERVER_ERROR;
  }
  res.status(status).json(responseJSON);
});

module.exports = router;

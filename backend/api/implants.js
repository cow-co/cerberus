const express = require("express");
const router = express.Router();
const implantService = require("../db/services/implant-service");
const statusCodes = require("../config/statusCodes");
const accessManager = require("../security/user-and-access-manager");
const { log, levels } = require("../utils/logger");

router.get("", accessManager.verifyToken, async (req, res) => {
  log("GET /implants/", "Request to get all implants", levels.DEBUG);
  let responseJSON = {
    implants: null,
    errors: [],
  };
  let status = statusCodes.OK;
  try {
    const allImplants = await implantService.getAllImplants();
    const { filtered, errors } = await accessManager.filterImplantsForView(
      allImplants,
      req.data.userId
    );
    if (errors.length > 0) {
      responseJSON.errors = errors;
    } else {
      responseJSON.implants = filtered;
    }
  } catch (err) {
    log("GET /implants/", err, levels.ERROR);
    responseJSON.errors = ["Internal Server Error"];
    status = statusCodes.INTERNAL_SERVER_ERROR;
  }
  res.status(status).json(responseJSON);
});

router.delete(
  "/:implantId",
  accessManager.verifyToken,
  accessManager.checkAdmin,
  async (req, res) => {
    const implantId = req.paramString("implantId");
    log(`DELETE /implants/${implantId}`, `Implant ${implantId}`, levels.INFO);

    let responseJSON = {
      errors: [],
    };
    let returnStatus = statusCodes.OK;

    try {
      const implant = await implantService.findImplantById(implantId);
      if (implant) {
        await implantService.deleteImplant(implantId);
      } else {
        log(
          `DELETE /implants/${implantId}`,
          `Implant with ID ${implantId} does not exist`,
          levels.WARN
        );
      }
    } catch (err) {
      returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
      responseJSON.errors.push("Internal Server Error");
      log(`DELETE /implants/${implantId}`, err, levels.ERROR);
    }

    return res.status(returnStatus).json(responseJSON);
  }
);

module.exports = router;

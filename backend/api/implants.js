const express = require("express");
const router = express.Router();
const implantService = require("../db/services/implant-service");
const statusCodes = require("../config/statusCodes");
const accessManager = require("../security/user-and-access-manager");
const { log, levels } = require("../utils/logger");

/**
 * Retrieves all the implants that the user is authorised to view.
 */
router.get("", accessManager.verifyToken, async (req, res) => {
  log("GET /implants", "Request to get all implants", levels.DEBUG);
  let response = {
    implants: [],
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
      response.errors = errors;
    } else {
      response.implants = filtered;
    }
  } catch (err) {
    log("GET /implants/", err, levels.ERROR);
    response.errors = ["Internal Server Error"];
    status = statusCodes.INTERNAL_SERVER_ERROR;
  }

  res.status(status).json(response);
});

router.delete("/:implantId", accessManager.verifyToken, async (req, res) => {
  const implantId = req.paramString("implantId");
  log(`DELETE /implants/${implantId}`, `Implant ${implantId}`, levels.INFO);

  let response = {
    errors: [],
  };
  let status = statusCodes.OK;

  try {
    const isAuthed = await accessManager.authZCheck(
      accessManager.operationType.EDIT,
      accessManager.targetEntityType.IMPLANT,
      implantId,
      accessManager.accessControlType.ADMIN,
      req.data.userId
    );

    if (isAuthed) {
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
    } else {
      status = statusCodes.FORBIDDEN;
      response.errors.push("Not authorised to delete implant");
      log(
        `DELETE /implants/${implantId}`,
        `Non-admin user ${req.data.userId} attempted to delete an implant`,
        levels.SECURITY
      );
    }
  } catch (err) {
    status = statusCodes.INTERNAL_SERVER_ERROR;
    response.errors.push("Internal Server Error");
    log(`DELETE /implants/${implantId}`, err, levels.ERROR);
  }

  res.status(status).json(response);
});

module.exports = router;

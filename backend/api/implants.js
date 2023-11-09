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

router.delete(
  "/:implantId",
  accessManager.verifySession,
  accessManager.checkAdmin,
  async (req, res) => {
    log(
      `DELETE /implants/${req.params.implantId}`,
      `Implant ${req.params.implantId}`,
      levels.INFO
    );

    let responseJSON = {
      errors: [],
    };
    let returnStatus = statusCodes.OK;

    try {
      const implant = await implantService.findImplantById(
        req.params.implantId
      );
      if (implant) {
        await implantService.deleteImplant(req.params.implantId);
      } else {
        log(
          `DELETE /implants/${req.params.implantId}`,
          `Implant with ID ${req.params.implantId} does not exist`,
          levels.WARN
        );
      }
    } catch (err) {
      returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
      responseJSON.errors.push("Internal Server Error");
      log(`DELETE /implants/${req.params.implantId}`, err, levels.ERROR);
    }

    return res.status(returnStatus).json(responseJSON);
  }
);

module.exports = router;

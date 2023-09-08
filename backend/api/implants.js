const express = require("express");
const router = express.Router();
const {
  findImplantById,
  getAllImplants,
} = require("../db/services/implant-service");
const statusCodes = require("../config/statusCodes");

// TODO requires authz
router.get("", async (req, res) => {
  const showInactive = req.query.includeInactive;
  const implants = await getAllImplants(showInactive);
  const responseJSON = {
    implants: implants,
    errors: [],
  };
  return res.status(statusCodes.OK).json(responseJSON);
});

module.exports = router;

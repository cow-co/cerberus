const express = require("express");
const router = express.Router();
const {
  findImplantById,
  getAllImplants,
} = require("../db/services/implant-service");
const statusCodes = require("../config/statusCodes");
const sinon = require("sinon");

// TODO This requires filling out
//  Also requires authz
//  Also requires an optional path variable includeInactive
router.get("/", async (req, res) => {
  const implants = getAllImplants();
  const responseJSON = {
    implants: implants,
    errors: [],
  };
  return res.status(statusCodes.OK).json(responseJSON);
});

module.exports = router;

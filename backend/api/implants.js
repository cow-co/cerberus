const express = require("express");
const router = express.Router();
const { getAllImplants } = require("../db/services/implant-service");
const statusCodes = require("../config/statusCodes");
const { verifySession } = require("../users/user-manager");

router.get("", verifySession, async (req, res) => {
  const implants = await getAllImplants();
  const responseJSON = {
    implants: implants,
    errors: [],
  };
  return res.status(statusCodes.OK).json(responseJSON);
});

module.exports = router;

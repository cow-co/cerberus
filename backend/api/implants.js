const express = require("express");
const router = express.Router();
const { getAllImplants } = require("../db/services/implant-service");
const statusCodes = require("../config/statusCodes");
const { verifySession } = require("../security/user-and-access-manager");
const ResponseDTO = require("../api/dto/ResponseDTO");

router.get("", verifySession, async (req, res) => {
  const implants = await getAllImplants();
  const responseJSON = new ResponseDTO(implants, []);
  return res.status(statusCodes.OK).json(responseJSON);
});

module.exports = router;

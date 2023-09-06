const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const logger = require("../utils/logger");

router.get("/beacon", async (req, res) => {
  logger.log("/beacon", `Received beacon: ${req.body}`, logger.levels.DEBUG);
  let returnStatus = statusCodes.OK;
  let responseJSON = {}; // TODO make the response DTOs into their own classes
});

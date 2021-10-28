// Handles beacon requests from implants
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
    const beaconContents = req.body;
    let responseStatus = 400;
    if(beaconContents.id === 101) {
        responseStatus = 200;
    }
    return res.status(responseStatus).json({message: "Success"});
});

module.exports = router;
// Handles beacon requests from implants
const express = require("express");
const router = express.Router();

// TODO We'll improve this, by making the password based in some way on a key built in to the implant, and on the implant ID
const checkPassword = (givenPassword) => {
    let valid = false;
    // TODO check if password-protection is enabled, in config
    if(givenPassword === "password1") {
        valid = true;
    }
    return valid;
}

router.post("/", async (req, res) => {
    const beaconContents = req.body;
    let responseStatus = 400;
    let responseMessage = "Bad Request";

    // TODO Connect to database to check if ID already exists; if not, create an entry for it
    if(!checkPassword(beaconContents.password)) {
        responseStatus = 403;
        responseMessage = "Unauthorised";
    } else {
        if(beaconContents.id === 101) {
            responseStatus = 200;
            responseMessage = "Success";
        }
    }
    
    return res.status(responseStatus).json({message: responseMessage});
});

module.exports = router;
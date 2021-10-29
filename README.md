# CERBERUS

## HTTP C2 Frontend for the RICE BOWL Suite

## What is RICE BOWL?

The RICE BOWL *suite* is a set of tools and implants designed as a sort of "malware" (though expressly *not* for illegal uses) as a fun side-project for myself.

The RICE BOWL *implant* is the main implant in the suite (written in C), and handles things like beaconing back to the C2 server.

## What is CERBERUS?

CERBERUS is a frontend to the C2 for the RICE BOWL suite. CERBERUS allows operators to control the queue of commands to be sent to implants, and to conduct other orchestration operations. It also exposes endpoints for the implants to beacon out to, to receive commands.

## License

The license for this software (and that of other elements of the RICE BOWL suite) is modified from the MIT license. Specifically, a condition has been added to reflect the fact that the suite is full of risky tools which may be put to nefarious uses. 

## Antivirus

Once complete (and de-privated) all implants and tools for the RICE BOWL suite will be submitted numerous times, under various encodings, to VirusTotal. This should ensure that the risk of the suite being used successfully in the wild is minimised.
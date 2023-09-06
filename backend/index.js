const express = require("express");
const beacons = require("./api/beaconing");
const swaggerUI = require("swagger-ui-express");
const logger = require("./utils/logger");
const YAML = require("yamljs");
const swaggerDocBeaconing = YAML.load("openapi/beaconing.yaml");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api-docs/beaconing",
  swaggerUI.serve,
  swaggerUI.setup(swaggerDocBeaconing)
);
app.use("/api/beacon", beacons);

const port = process.env.PORT || 5000;
let server = app.listen(port, async () => {
  logger.log("index.js", `server running on port ${port}`, logger.levels.INFO);
});

const stop = () => {
  logger.log("index.js", "Closing server...", logger.levels.INFO);

  server.shutdown(() => {
    logger.log("index.js", "Server closed...", logger.levels.INFO);
  });
};

server = shutdown(server);
module.exports = server;
module.exports.stop = stop;

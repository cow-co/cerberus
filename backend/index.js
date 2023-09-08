const express = require("express");
const beacons = require("./api/beaconing");
const implants = require("./api/implants");
const swaggerUI = require("swagger-ui-express");
const logger = require("./utils/logger");
const YAML = require("yamljs");
const swaggerDocBeaconing = YAML.load("openapi/beaconing.yaml");
const swaggerDocImplants = YAML.load("openapi/implants.yaml");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Only connect to the database if we are in prod
if (process.env.NODE_ENV === "production") {
  const db = require("./config/dbConfig").mongo_uri;
  mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() =>
      logger.log(
        "index.js",
        "MongoDB connection successful",
        logger.levels.INFO
      )
    )
    .catch((err) => logger.log("index.js", err, logger.levels.ERROR));
  seedAircraft();
}

app.use(
  "/api-docs/beaconing",
  swaggerUI.serve,
  swaggerUI.setup(swaggerDocBeaconing)
);
app.use("/api/beacon", beacons);
app.use(
  "/api-docs/implants",
  swaggerUI.serve,
  swaggerUI.setup(swaggerDocImplants)
);
app.use("/api/implants", implants);

const port = process.env.PORT || 5000;
let server = app.listen(port, async () => {
  logger.log("index.js", `server running on port ${port}`, logger.levels.INFO);
});

const stop = () => {
  logger.log("index.js", "Closing server...", logger.levels.INFO);

  if (process.env.NODE_ENV === "production") {
    mongoose.disconnect();
  }

  server.shutdown(() => {
    logger.log("index.js", "Server closed...", logger.levels.INFO);
  });
};

module.exports = server;
module.exports.stop = stop;

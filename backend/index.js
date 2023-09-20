const express = require("express");
const beacons = require("./api/beaconing");
const implants = require("./api/implants");
const tasks = require("./api/tasks");
const users = require("./api/users");
const swaggerUI = require("swagger-ui-express");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const YAML = require("yamljs");
const swaggerDocBeaconing = YAML.load("openapi/beaconing.yaml");
const swaggerDocImplants = YAML.load("openapi/implants.yaml");
const path = require("path");
const { seedTaskTypes } = require("./db/seed");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const securityConfig = require("./config/security-config");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "production") {
  const db = require("./config/dbConfig").mongo_uri;
  const mongoClient = mongoose
    .connect(db, { useNewUrlParser: true })
    .then((mongo) => {
      logger.log(
        "index.js",
        "MongoDB connection successful",
        logger.levels.INFO
      );
      return mongo.connection.getClient();
    })
    .catch((err) => logger.log("index.js", err, logger.levels.ERROR));

  app.use(
    session({
      secret: securityConfig.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        clientPromise: mongoClient,
        stringify: false,
        autoRemove: "interval",
      }),
    })
  );
} else {
  app.use(
    session({
      secret: securityConfig.sessionSecret,
      resave: false,
      saveUninitialized: false,
    })
  );
}

(async () => {
  await seedTaskTypes();
})();

app.use(express.static(path.join(__dirname, "build")));
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
app.use("/api", tasks);
app.use("/api/users", users);

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

const serveProdClient = () => {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(__dirname, "./build/index.html"));
    });

    console.log("Serving React App...");
  }
};
serveProdClient();

module.exports = server;
module.exports.stop = stop;

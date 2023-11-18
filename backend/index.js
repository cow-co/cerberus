const express = require("express");
const beacons = require("./api/beaconing");
const implants = require("./api/implants");
const implantService = require("./db/services/implant-service");
const tasks = require("./api/tasks");
const access = require("./api/access");
const users = require("./api/users");
const swaggerUI = require("swagger-ui-express");
const mongoose = require("mongoose");
const { levels, log } = require("./utils/logger");
const YAML = require("yamljs");
const swaggerDoc = YAML.load("openapi/openapi.yaml");
const path = require("path");
const seeding = require("./db/seed");
const securityConfig = require("./config/security-config");
const { SwaggerTheme } = require("swagger-themes");
const https = require("https");
const fs = require("fs");
const http = require("http");
const nodeCron = require("node-cron");
const { WebSocketServer } = require("ws");
const { handleConnect } = require("./utils/web-sockets");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "production") {
  log("index.js", "Connecting to db...", levels.INFO);
  const db = require("./config/dbConfig").mongo_uri;
  mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => {
      log("index.js", "MongoDB connection successful", levels.INFO);
    })
    .catch((err) => log("index.js", err, levels.ERROR));
  mongoose.set("sanitizeFilter", true); // Sanitise by default

  // Seed DB and set up scheduled tasks
  (async () => {
    await seeding.seedTaskTypes();
    await seeding.seedInitialAdmin();
    nodeCron.schedule("*/5 * * * *", async () => {
      await implantService.checkActivity();
    });
  })();
}

app.use(express.static(path.join(__dirname, "build")));
app.use("/api/beacon", beacons);
app.use("/api/implants", implants);
app.use("/api", tasks);
app.use("/api/access", access);
app.use("/api/users", users);

const theme = new SwaggerTheme("v3");
const darkStyle = theme.getBuffer("dark");
app.use(
  "/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerDoc, { customCss: darkStyle })
);

const port = process.env.PORT || 443;
let server = null;
let wsServer = null;
const stop = () => {
  log("index.js", "Closing server...", levels.INFO);

  if (process.env.NODE_ENV === "production") {
    mongoose.disconnect();
  }

  server.close();
};

const serve = () => {
  if (process.env.NODE_ENV === "production") {
    let opts;

    if (securityConfig.certType === "PFX") {
      opts = {
        pfx: fs.readFileSync(securityConfig.certFile),
        passphrase: securityConfig.certPassword,
      };
    } else {
      // Default to PEM
      opts = {
        cert: fs.readFileSync(securityConfig.certFile),
        key: fs.readFileSync(securityConfig.keyFile),
        passphrase: securityConfig.certPassword,
      };
    }

    server = https.createServer(opts, app).listen(port, async () => {
      log("index.js", `server running on port ${port}`, levels.INFO);
    });
    app.use(express.static("client/build"));
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(__dirname, "./build/index.html"));
    });

    log("index.js", "Serving React App...", levels.INFO);
  } else {
    server = http.createServer(app).listen(port, async () => {
      log("index.js", `server running on port ${port}`, levels.INFO);
    });
  }
};

serve();
wsServer = new WebSocketServer({ server });
wsServer.on("connection", handleConnect);

module.exports = server;
module.exports.stop = stop;

const express = require("express");
const swaggerUI = require("swagger-ui-express");
const mongoose = require("mongoose");
const YAML = require("yamljs");
const { SwaggerTheme } = require("swagger-themes");
const https = require("https");
const fs = require("fs");
const http = require("http");
const nodeCron = require("node-cron");
const { WebSocketServer } = require("ws");
const { default: rateLimit } = require("express-rate-limit");
const path = require("path");
const sanitize = require("sanitize");

const beacons = require("./api/beaconing");
const implants = require("./api/implants");
const tasks = require("./api/tasks");
const access = require("./api/access");
const users = require("./api/users");

const seeding = require("./db/seed");
const implantService = require("./db/services/implant-service");
const { handleConnect } = require("./utils/web-sockets");
const { levels, log } = require("./utils/logger");
const securityConfig = require("./config/security-config");
const {validateSecurityConfig} = require("./validation/config-validation");

const swaggerDoc = YAML.load("openapi/openapi.yaml");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitize.middleware);

const {isValid, errors} = validateSecurityConfig(securityConfig);
console.log(JSON.stringify(securityConfig));
if (!isValid) {
  log("index", JSON.stringify(errors), levels.FATAL);
  throw new Error("Bad Configuration! See log messages for details.");
} else {
  log("index", "Security config is valid.", levels.INFO);
}

if (process.env.NODE_ENV === "production") {
  log("index", "Connecting to db", levels.INFO);
  const db = require("./config/dbConfig").mongo_uri;
  mongoose
    .connect(db)
    .then(() => {
      log("index", "MongoDB connection successful", levels.INFO);
    })
    .catch((err) => log("index.js", err, levels.ERROR));
  mongoose.set("sanitizeFilter", true); // Sanitise by default

  // Uses an in-memory store, which should be fine for most purposes.
  // If you're especially worried, you can simply reduce the rate/window
  const limiter = rateLimit({
    windowMs: securityConfig.rateLimit.windowTimeMS,
    limit: securityConfig.rateLimit.maxRequestsInWindow,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });
  app.use(limiter);

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
  log("index", "Closing server...", levels.INFO);

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
      log("index", `Server running on port ${port}`, levels.INFO);
    });
    app.use(express.static("client/build"));
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(__dirname, "./build/index.html"));
    });

    log("index", "Serving frontend...", levels.INFO);
  } else {
    server = http.createServer(app).listen(port, async () => {
      log("index", `Server running on port ${port}`, levels.INFO);
    });
  }
};

serve();
wsServer = new WebSocketServer({ server });
wsServer.on("connection", handleConnect);

module.exports = server;
module.exports.stop = stop;

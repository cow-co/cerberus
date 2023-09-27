const express = require("express");
const beacons = require("./api/beaconing");
const implants = require("./api/implants");
const tasks = require("./api/tasks");
const access = require("./api/access");
const users = require("./api/users");
const swaggerUI = require("swagger-ui-express");
const mongoose = require("mongoose");
const { levels, log } = require("./utils/logger");
const YAML = require("yamljs");
const swaggerDoc = YAML.load("openapi/openapi.yaml");
const path = require("path");
const { seedTaskTypes, seedInitialAdmin } = require("./db/seed");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const securityConfig = require("./config/security-config");
const { SwaggerTheme } = require("swagger-themes");

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

  app.use(
    session({
      secret: securityConfig.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: mongoose.connection.getClient(),
        stringify: false,
        autoRemove: "interval",
      }),
      cookie: {
        maxAge: 8 * 60 * 60 * 1000, // Eight hours
        httpOnly: false,
      },
    })
  );

  (async () => {
    await seedTaskTypes();
    await seedInitialAdmin();
  })();
} else {
  app.use(
    session({
      secret: securityConfig.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 8 * 60 * 60 * 1000, // Eight hours
        httpOnly: false,
      },
    })
  );
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

const port = process.env.PORT || 5000;
let server = app.listen(port, async () => {
  log("index.js", `server running on port ${port}`, levels.INFO);
});

const stop = () => {
  log("index.js", "Closing server...", levels.INFO);

  if (process.env.NODE_ENV === "production") {
    mongoose.disconnect();
  }

  server.shutdown(() => {
    log("index.js", "Server closed...", levels.INFO);
  });
};

const serveProdClient = () => {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(__dirname, "./build/index.html"));
    });

    log("index.js", "Serving React App...", levels.INFO);
  }
};
serveProdClient();

module.exports = server;
module.exports.stop = stop;

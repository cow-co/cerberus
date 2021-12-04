const express = require("express");
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocImp = YAML.load("docs/openapi/api/v1/imp.yaml");
const beacon = require("./api/v1/imp/beacon");
const initDBAdapter = require("./db/adapter");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/doc/imp", swaggerUI.serve, swaggerUI.setup(swaggerDocImp));
app.use("/api/v1/imp/beacon", beacon)

const port = process.env.PORT || 8080;
let server = app.listen(port, async () => {
  console.info(`Server running on port ${port}`);
  initDBAdapter();
});

module.exports = server;
const express = require("express");
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocImp = YAML.load("docs/openapi/imp.yaml");
const beacon = require("./api/v1/imp/beacon");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/doc/imp", swaggerUI.serve, swaggerUI.setup(swaggerDocImp));
app.use("/api/v1/imp/beacon", beacon)

const port = process.env.PORT || 5000;
let server = app.listen(port, async () => {
  console.log(`server running on port ${port}`);
});

module.exports = server;
const express = require("express");
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocImp = YAML.load("docs/openapi/imp.yaml");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/doc/imp", swaggerUI.serve, swaggerUI.setup(swaggerDocImp));

const port = process.env.PORT || 5000;
let server = app.listen(port, async () => {
  console.log(`server running on port ${port}`);
});

module.exports = server;
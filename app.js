const express = require("express");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;
let server = app.listen(port, async () => {
  console.log(`server running on port ${port}`);
});

module.exports = server;
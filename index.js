const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "client", "build")));

const port = process.env.PORT || 5000;
let server = app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
});

const serveProdFrontend = () => {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join("client", "build")));
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(__dirname, "client", "build", "index.html"));
    });
    console.log("Serving frontend...");
  }
};
serveProdFrontend();

module.exports = server;

const { WebSocket } = require("ws");
const { log, levels } = require("./logger");
const uuidv4 = require("uuid").v4;

const entityTypes = {
  TASKS: "TASKS",
  TASK_TYPES: "TASK_TYPES",
  IMPLANTS: "IMPLANTS",
};

let clients = {};

const handleConnect = (connection) => {
  const clientId = uuidv4();
  log("handleConnect", `${clientId} connected`, levels.DEBUG);
  clients[clientId] = connection;
  connection.on("close", () => handleDisconnect(clientId));
};

const handleDisconnect = (clientId) => {
  log("handleDisconnect", `${clientId} disconnected`, levels.DEBUG);
  delete clients[clientId];
};

const sendMessage = (data) => {
  const json = JSON.stringify(data);
  for (const clientId in clients) {
    const client = clients[clientId];
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  }
};

module.exports = {
  entityTypes,
  handleConnect,
  handleDisconnect,
  sendMessage,
};

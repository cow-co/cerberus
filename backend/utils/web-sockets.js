const { WebSocket } = require("ws");
const { log, levels } = require("./logger");
const uuidv4 = require("uuid").v4;

const messageTypes = {
  TASKS: "TASKS",
  TASK_TYPES: "TASK_TYPES",
  IMPLANTS: "IMPLANTS",
};

let clients = {};

const handleConnect = (connection) => {
  const clientId = uuidv4();
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
  messageTypes,
  handleConnect,
  handleDisconnect,
  sendMessage,
};

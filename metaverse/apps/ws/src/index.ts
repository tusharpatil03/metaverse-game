import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 80 });

wss.on("connection", function (ws) {
  ws.on("error", console.error);
});

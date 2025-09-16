import { WebSocketServer } from 'ws';
import { User } from './User';
import url from 'url';

const wss = new WebSocketServer({ port: 3001 });

console.log('WebSocket server is running on ws://localhost:3001');

wss.on('connection', function connection(ws, req) {
  const spaceId = url.parse(req.url!, true).query.spaceId as string;

  if (!spaceId) {
    ws.close();
    return;
  }

  let user = new User(ws, spaceId);
  ws.on("error", console.error);

  ws.on("close", () => {
    user?.destroy();
  });
});
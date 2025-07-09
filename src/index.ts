import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { v4 } from "uuid";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

interface IdentifiedWebSocket extends WebSocket {
  id: string;
}
const rooms = new Map<string, Set<string>>();
const clients = new Map<string, IdentifiedWebSocket>();
const roomConnected = new Map<string, string>();

wss.on("connection", function connection(socket: IdentifiedWebSocket) {
  const id = v4();
  socket.id = id;
  clients.set(id, socket);

  socket.on("error", (error) => {
    console.log(error);
  });

  socket.on("message", function message(data) {
    try {
      const message = JSON.parse(data.toString());
      console.log(message);
      socket.send(data.toString());

      console.log(
        message.type,
        message.roomId,
        rooms.has(message.roomId),
        message.type && message.type === "join"
      );
      if (message.type && message.type === "join") {
        if (rooms.has(message.roomId)) {
          const users = rooms.get(message.roomId) || new Set<string>();
          console.log(users.size);
          if (users.size >= 4) {
            const sendMessage = {
              success: false,
              message: "limit reached",
            };
            socket.send(JSON.stringify(sendMessage));
            socket.terminate();
            return;
          }
          users.add(socket.id);
          rooms.set(message.roomId, users);
          roomConnected.set(socket.id, message.roomId);
        } else {
          const users = new Set<string>();
          users.add(socket.id);
          console.log(
            message.type,
            message.roomId,
            rooms.has(message.roomId),
            users,
            rooms
          );
          rooms.set(message.roomId, users);
          roomConnected.set(socket.id, message.roomId);
        }
      }
    } catch (error) {
      console.log(error);
      socket.send("invalid message!");
    }
  });
  socket.on("close", () => {
    clients.delete(socket.id);
    const roomId = roomConnected.get(socket.id);
    if(roomId){
      const users = rooms.get(roomId) || new Set<string>();
      users?.delete(socket.id);
      rooms.set(roomId, users);
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
  socket.send("something");
});

server.listen(3000, function () {
  console.log("Listening on http://localhost:3000");
});

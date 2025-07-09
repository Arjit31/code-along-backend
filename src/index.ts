import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { v4 } from "uuid";
import { IdentifiedWebSocket } from "./types/socket";
import { joinHandler } from "./handlers/joinHandler";
import { offerHandler } from "./handlers/offerHandler";
import { answerHandler } from "./handlers/answerHandler";
import { iceHandler } from "./handlers/iceHandler";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

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

      if (message.type === "join") {
        joinHandler({ rooms, socket, message, roomConnected });
      } else if (message.type === "createOffer") {
        offerHandler({ rooms, socket, message, roomConnected, clients });
      } else if (message.type === "createAnswer") {
        answerHandler({ rooms, socket, message, roomConnected, clients });
      } else if (message.type === "iceCandidate") {
        iceHandler({ rooms, socket, message, roomConnected, clients });
      } else {
        const sendMessage = {
          success: false,
          message: "invalid message type!",
        };
        socket.send(JSON.stringify(sendMessage));
      }
    } catch (error) {
      console.log(error);
      const sendMessage = {
        success: false,
        message: "invalid message!",
      };
      socket.send(JSON.stringify(sendMessage));
      socket.send("invalid message!");
    }
  });
  socket.on("close", () => {
    clients.delete(socket.id);
    roomConnected.delete(socket.id);
    const roomId = roomConnected.get(socket.id);
    if (roomId) {
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

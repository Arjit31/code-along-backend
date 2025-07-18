import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { v4 } from "uuid";
import { IdentifiedWebSocket } from "./types/socket";
import { joinHandler } from "./handlers/joinHandler";
import { offerHandler } from "./handlers/offerHandler";
import { answerHandler } from "./handlers/answerHandler";
import { iceHandler } from "./handlers/iceHandler";
import cors from "cors";
import { docHandler } from "./handlers/docHandler";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());

const rooms = new Map<string, Set<string>>();
const clients = new Map<string, IdentifiedWebSocket>();
const roomConnected = new Map<string, string>();
const roomDocuments = new Map<string, string>();

wss.on("connection", function connection(socket: IdentifiedWebSocket) {
  const id = v4();
  socket.id = id;
  clients.set(id, socket);
  socket.isAlive = true;

  const startHeartbeat = () => {
    socket.heartbeatTimer = setInterval(() => {
      if (socket.isAlive === false) {
        console.log("Client didn't respond to ping, terminating connection");
        clearInterval(socket.heartbeatTimer);
        return socket.terminate();
      }

      socket.isAlive = false;
      socket.ping();
      console.log("Ping sent to client");
    }, 30000);
  };

  socket.on("pong", function () {
    console.log("Pong received from client");
    socket.isAlive = true;
  });

  socket.on("ping", function () {
    console.log("Ping received from client");
    socket.pong();
  });

  socket.on("error", (error) => {
    console.log(error);
  });

  socket.on("message", function message(data) {
    socket.isAlive = true;
    try {
      const message = JSON.parse(data.toString());

      if (message.type === "join") {
        joinHandler({ rooms, socket, message, roomConnected, clients, roomDocuments });
      } else if (message.type === "createOffer") {
        offerHandler({ rooms, socket, message, roomConnected, clients });
      } else if (message.type === "createAnswer") {
        answerHandler({ rooms, socket, message, roomConnected, clients });
      } else if (message.type === "iceCandidate") {
        iceHandler({ rooms, socket, message, roomConnected, clients });
      } else if (message.type === "docUpdate") {
        docHandler({ rooms, socket, message, roomConnected, clients, roomDocuments });
      }
    } catch (error) {
      console.log(error);
      const sendMessage = {
        success: false,
        message: "invalid message!",
      };
      socket.send(JSON.stringify(sendMessage));
    }
  });

  socket.on("close", () => {
    clients.delete(socket.id);
    const roomId = roomConnected.get(socket.id);
    roomConnected.delete(socket.id);
    if (roomId) {
      const users = rooms.get(roomId) || new Set<string>();
      users.delete(socket.id);
      if (users.size === 0) {
        rooms.delete(roomId);
      } else {
        rooms.set(roomId, users);
        users.forEach((userId: string) => {
          const sendMessage = {
            type: "close",
            senderId: socket.id,
          };
          const receiver = clients.get(userId);
          receiver?.send(JSON.stringify(sendMessage));
        });
      }
    }
    if (socket.heartbeatTimer) {
      clearInterval(socket.heartbeatTimer);
    }
    console.log(`Client disconnected: ${socket.id}`);
  });

  startHeartbeat();
  socket.send(`{"text": "connection established"}`);
});

app.post("/create-room", function (req, res) {
  try {
    const id = v4();
    const users = new Set<string>();
    rooms.set(id, users);
    res.json({ success: true, roomId: id, message: "room created!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error });
  }
});

app.get("/create-room", function (req, res) {
  res.json("check");
});

server.listen(3000, function () {
  console.log("Listening on http://localhost:3000");
});

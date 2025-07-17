"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const joinHandler_1 = require("./handlers/joinHandler");
const offerHandler_1 = require("./handlers/offerHandler");
const answerHandler_1 = require("./handlers/answerHandler");
const iceHandler_1 = require("./handlers/iceHandler");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
app.use((0, cors_1.default)());
const rooms = new Map();
const clients = new Map();
const roomConnected = new Map();
wss.on("connection", function connection(socket) {
    const id = (0, uuid_1.v4)();
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
            console.log(message);
            // socket.send(data.toString());
            if (message.type === "join") {
                (0, joinHandler_1.joinHandler)({ rooms, socket, message, roomConnected, clients });
            }
            else if (message.type === "createOffer") {
                (0, offerHandler_1.offerHandler)({ rooms, socket, message, roomConnected, clients });
            }
            else if (message.type === "createAnswer") {
                (0, answerHandler_1.answerHandler)({ rooms, socket, message, roomConnected, clients });
            }
            else if (message.type === "iceCandidate") {
                (0, iceHandler_1.iceHandler)({ rooms, socket, message, roomConnected, clients });
            }
            else {
                const sendMessage = {
                    success: false,
                    message: "invalid message type!",
                };
                socket.send(JSON.stringify(sendMessage));
            }
        }
        catch (error) {
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
        const roomId = roomConnected.get(socket.id);
        roomConnected.delete(socket.id);
        if (roomId) {
            const users = rooms.get(roomId) || new Set();
            users === null || users === void 0 ? void 0 : users.delete(socket.id);
            rooms.set(roomId, users);
            if (users.size === 0)
                rooms.delete(roomId);
            else {
                users.forEach((userId) => {
                    const sendMessage = {
                        type: "close",
                        senderId: socket.id,
                    };
                    const receiver = clients.get(userId);
                    receiver === null || receiver === void 0 ? void 0 : receiver.send(JSON.stringify(sendMessage));
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
        const id = (0, uuid_1.v4)();
        const users = new Set();
        rooms.set(id, users);
        res.json({ success: true, roomId: id, message: "room created!" });
    }
    catch (error) {
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

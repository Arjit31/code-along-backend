"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
let rooms = new Map();
wss.on('connection', function connection(socket) {
    socket.on('error', (error) => { console.log(error); });
    socket.on('message', function message(data) {
        console.log('received: %s', data);
        try {
            const message = JSON.parse(data.toString());
            console.log(message);
            socket.send(message);
        }
        catch (error) {
            console.log(error);
            socket.send("invalid message!");
        }
    });
    socket.send('something');
});
server.listen(3000, function () {
    console.log('Listening on http://localhost:3000');
});

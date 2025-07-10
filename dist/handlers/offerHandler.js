"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerHandler = offerHandler;
// used object rather then direct parameters to the function to not pass them as value
// but pass them as reference
function offerHandler({ rooms, message, socket, roomConnected, clients, }) {
    const roomId = roomConnected.get(socket.id);
    if (!rooms.has(roomId + "")) {
        throw new Error("room not found!");
    }
    const users = rooms.get(roomId + "") || new Set();
    for (const user of users) {
        if (socket.id == user) {
            continue;
        }
        const sendMessage = {
            success: true,
            type: message.type,
            offer: message.offer,
            senderId: socket.id,
        };
        const receiver = clients.get(user);
        receiver === null || receiver === void 0 ? void 0 : receiver.send(JSON.stringify(sendMessage));
    }
}

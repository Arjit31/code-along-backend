"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iceHandler = iceHandler;
// used object rather then direct parameters to the function to not pass them as value
// but pass them as reference
function iceHandler({ rooms, message, socket, roomConnected, clients, }) {
    const roomId = roomConnected.get(socket.id);
    if (!rooms.has(roomId + "")) {
        throw new Error("room not found!");
    }
    if (socket.id == message.receiverId) {
        throw new Error("same sender!");
    }
    const sendMessage = {
        success: true,
        type: message.type,
        ice: message.ice,
        senderId: socket.id,
    };
    const receiver = clients.get(message.receiverId);
    receiver === null || receiver === void 0 ? void 0 : receiver.send(JSON.stringify(sendMessage));
}

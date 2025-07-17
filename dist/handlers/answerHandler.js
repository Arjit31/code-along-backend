"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerHandler = answerHandler;
// used object rather then direct parameters to the function to not pass them as value
// but pass them as reference
function answerHandler({ rooms, message, socket, roomConnected, clients, }) {
    const senderId = message.senderId;
    const receiverId = socket.id;
    const roomId1 = roomConnected.get(receiverId);
    const roomId2 = roomConnected.get(senderId);
    console.log(roomConnected, senderId, receiverId);
    if (!rooms.has(roomId1 + "") ||
        (roomId1 !== roomId2 && senderId != receiverId)) {
        throw new Error("room not found!");
    }
    const sendMessage = {
        success: true,
        type: message.type,
        answer: message.answer,
        receiverId: receiverId,
    };
    const sender = clients.get(senderId);
    sender === null || sender === void 0 ? void 0 : sender.send(JSON.stringify(sendMessage));
}

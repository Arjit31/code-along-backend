"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinHandler = joinHandler;
// used object rather then direct parameters to the function to not pass them as value
// but pass them as reference
function joinHandler({ rooms, message, socket, roomConnected, clients, }) {
    if (rooms.has(message.roomId)) {
        const users = rooms.get(message.roomId) || new Set();
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
        users.forEach((client) => {
            console.log(socket.id, client, (client !== socket.id));
            if (client !== socket.id) {
                const sendMessage = {
                    success: true,
                    type: message.type,
                    receiverId: socket.id,
                    name: message.name
                };
                console.log(sendMessage);
                const receiver = clients.get(client);
                receiver === null || receiver === void 0 ? void 0 : receiver.send(JSON.stringify(sendMessage));
            }
        });
        console.log(roomConnected);
    }
    else {
        const sendMessage = {
            success: false,
            message: "no such room exist!",
        };
        socket.send(JSON.stringify(sendMessage));
        socket.terminate();
        return;
    }
    const sendMessage = {
        success: true,
        message: "joined!",
    };
    socket.send(JSON.stringify(sendMessage));
}

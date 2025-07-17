import { IdentifiedWebSocket } from "../types/socket";

// used object rather then direct parameters to the function to not pass them as value
// but pass them as reference
export function joinHandler({
  rooms,
  message,
  socket,
  roomConnected,
  clients,
}: {
  rooms: Map<string, Set<string>>;
  message: any;
  socket: IdentifiedWebSocket;
  roomConnected: Map<string, string>;
  clients: Map<string, IdentifiedWebSocket>;
}) {
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
    users.forEach((client) => {
      console.log(socket.id, client, (client !== socket.id))
      if (client !== socket.id) {
        const sendMessage = {
          success: true,
          type: message.type,
          receiverId: socket.id,
          name: message.name
        };
        console.log(sendMessage)
        const receiver = clients.get(client);
        receiver?.send(JSON.stringify(sendMessage));
      }
    });
    console.log(roomConnected);
  } else {
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

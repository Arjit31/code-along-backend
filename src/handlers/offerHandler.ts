import { IdentifiedWebSocket } from "../types/socket";

// used object rather then direct parameters to the function to not pass them as value
// but pass them as reference
export function offerHandler({
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
    offer: message.offer,
    senderId: socket.id,
  };
  const receiver = clients.get(message.receiverId);
  receiver?.send(JSON.stringify(sendMessage));
}

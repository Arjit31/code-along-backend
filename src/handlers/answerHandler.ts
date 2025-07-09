import { IdentifiedWebSocket } from "../types/socket";

// used object rather then direct parameters to the function to not pass them as value
// but pass them as reference
export function answerHandler({
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
  const senderId = message.senderId;
  const receiverId = socket.id;
  const roomId1 = roomConnected.get(receiverId);
  const roomId2 = roomConnected.get(senderId);
  console.log(roomConnected, senderId, receiverId);
  if (
    !rooms.has(roomId1 + "") ||
    (roomId1 !== roomId2 && senderId != receiverId)
  ) {
    throw new Error("room not found!");
  }
  const sendMessage = {
    success: true,
    type: message.type,
    answer: message.answer,
    receiver: message.receiver,
  };
  const sender = clients.get(senderId);
  sender?.send(JSON.stringify(sendMessage));
}

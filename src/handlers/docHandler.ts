import { IdentifiedWebSocket } from "../types/socket";

// used object rather then direct parameters to the function to not pass them as value
// but pass them as reference
export function docHandler({
  rooms,
  message,
  socket,
  roomConnected,
  clients,
  roomDocuments
}: {
  rooms: Map<string, Set<string>>;
  message: any;
  socket: IdentifiedWebSocket;
  roomConnected: Map<string, string>;
  clients: Map<string, IdentifiedWebSocket>;
  roomDocuments: Map<string, string>;
}) {
  const roomId = roomConnected.get(socket.id);
  if (!roomId) return;
  const users = rooms.get(roomId);
  if (!users) return;

  // Save document content for the room
  roomDocuments.set(roomId, message.content);

  // Broadcast to all other users in the room
  users.forEach((userId) => {
    if (userId !== socket.id) {
      const receiver = clients.get(userId);
      receiver?.send(
        JSON.stringify({
          type: "docUpdate",
          senderId: socket.id,
          content: message.content,
        })
      );
    }
  });
}

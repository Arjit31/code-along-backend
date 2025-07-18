import { IdentifiedWebSocket } from "../types/socket";

// used object rather then direct parameters to the function to not pass them as value
// but pass them as reference
export function docHandler({
  rooms,
  message,
  socket,
  roomConnected,
  clients,
  roomDocuments,
  roomVersions
}: {
  rooms: Map<string, Set<string>>;
  message: any;
  socket: IdentifiedWebSocket;
  roomConnected: Map<string, string>;
  clients: Map<string, IdentifiedWebSocket>;
  roomDocuments: Map<string, string>;
  roomVersions: Map<string, number>;
}) {
  const roomId = roomConnected.get(socket.id);
  if (!roomId) return;
  const users = rooms.get(roomId);
  if (!users) return;

  roomDocuments.set(roomId, message.content);
  const newVersion = (roomVersions.get(roomId) || 0) + 1;
  roomVersions.set(roomId, newVersion);
  
  users.forEach((userId) => {
      const receiver = clients.get(userId);
      receiver?.send(
        JSON.stringify({
          type: "docUpdate",
          senderId: socket.id,
          content: message.content,
          version: newVersion,
        })
      );
  });
}

import { IdentifiedWebSocket } from "../types/socket";

// used object rather then direct parameters to the function to not pass them as value
// but pass them as reference
export function demandHandler({
  message,
  socket,
  roomConnected,
  roomDocuments,
  roomVersions,
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

  const content  = roomDocuments.get(roomId);
  const version = (roomVersions.get(roomId) || 0);
  roomVersions.set(roomId, version);

  socket.send(
    JSON.stringify({
      type: "docUpdate",
      senderId: socket.id,
      content: content,
      version: version,
    })
  );
}

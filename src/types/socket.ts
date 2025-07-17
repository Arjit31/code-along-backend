import { WebSocket } from "ws";

export interface IdentifiedWebSocket extends WebSocket {
  id: string;
  isAlive?: boolean;
  heartbeatTimer?: NodeJS.Timeout;
}
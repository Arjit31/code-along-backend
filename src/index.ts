import express from 'express';
import http from 'http'
import { WebSocketServer } from 'ws';


const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(socket) {
  socket.on('error', console.error);

  socket.on('message', function message(data) {
    console.log('received: %s', data);
  });

  socket.send('something');
});


server.listen(8080, function () {
  console.log('Listening on http://localhost:8080');
});
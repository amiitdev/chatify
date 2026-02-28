import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
});

// 🔥 Store online users
let onlineUsers = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 🟢 When user joins
  socket.on('userJoined', (username) => {
    onlineUsers.push({
      socketId: socket.id,
      username,
    });

    io.emit('onlineUsers', onlineUsers);
  });

  // 🟢 When user disconnects
  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

    io.emit('onlineUsers', onlineUsers);
    console.log('User disconnected');
  });
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});

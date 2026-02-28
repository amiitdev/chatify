import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

const server = http.createServer(app);

// Store online users
let onlineUsers = [];

const allowedOrigins = [
  'http://localhost:5173',
  'https://chatify-4vwv.vercel.app',
];

// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

// const io = new Server(server, {
//   cors: {
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like Postman or server-to-server)
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://chatify-4vwv.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // User joined
  socket.on('userJoined', (username) => {
    console.log('👤 User joined:', username);

    const existingUserIndex = onlineUsers.findIndex(
      (u) => u.username === username,
    );

    if (existingUserIndex !== -1) {
      onlineUsers[existingUserIndex].socketId = socket.id;
      console.log(`🔄 Updated socket ID for ${username}`);
    } else {
      onlineUsers.push({
        socketId: socket.id,
        username,
      });
      console.log(`➕ New user added: ${username}`);
    }

    io.emit('onlineUsers', onlineUsers);
    console.log(
      '📋 Online users:',
      onlineUsers.map((u) => u.username),
    );
  });

  // User logout
  socket.on('userLogout', (username) => {
    console.log('🚪 User logged out:', username);
    onlineUsers = onlineUsers.filter((user) => user.username !== username);
    io.emit('onlineUsers', onlineUsers);
    socket.disconnect();
  });

  // ========================
  // FIXED: TYPING INDICATORS
  // ========================
  socket.on('typing', ({ from, toUsername }) => {
    console.log(`✏️ ${from} is typing to ${toUsername}`);

    // Find the receiver by username
    const receiver = onlineUsers.find((user) => user.username === toUsername);

    if (receiver) {
      // Send typing notification ONLY to the receiver
      io.to(receiver.socketId).emit('showTyping', from);
      console.log(`📨 Sent typing notification to ${toUsername}`);
    } else {
      console.log(`❌ Receiver ${toUsername} not found online`);
    }
  });

  socket.on('stopTyping', ({ from, toUsername }) => {
    console.log(`✏️ ${from} stopped typing to ${toUsername}`);

    // Find the receiver by username
    const receiver = onlineUsers.find((user) => user.username === toUsername);

    if (receiver) {
      // Send stop typing notification ONLY to the receiver
      io.to(receiver.socketId).emit('hideTyping');
      console.log(`📨 Sent stop typing notification to ${toUsername}`);
    }
  });

  // Private messages
  socket.on('privateMessage', (messageData) => {
    console.log(
      `📨 Message from ${messageData.from} to ${messageData.toUsername}`,
      messageData.type === 'image' ? '📷 Image' : '💬 Text',
    );

    // Make sure we're sending all the data
    const messageToSend = {
      id: messageData.id,
      from: messageData.from,
      to: messageData.to,
      toUsername: messageData.toUsername,
      message: messageData.message, // This contains the base64 for images
      time: messageData.time,
      timestamp: messageData.timestamp,
      type: messageData.type || 'text',
      fileName: messageData.fileName,
      fileSize: messageData.fileSize,
      mimeType: messageData.mimeType,
    };

    // Send to the specific user
    io.to(messageData.to).emit('receivePrivateMessage', messageToSend);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);

    const disconnectedUser = onlineUsers.find(
      (user) => user.socketId === socket.id,
    );

    if (disconnectedUser) {
      console.log(`👋 ${disconnectedUser.username} disconnected`);
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      io.emit('onlineUsers', onlineUsers);
      console.log(
        '📋 Remaining online users:',
        onlineUsers.map((u) => u.username),
      );
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║   🚀 Server running on port ${PORT}     ║
║   📡 WebSocket server ready           ║
╚════════════════════════════════════╝
  `);
});

# 💬 Chatify — Real-Time Chat Application

<p align="center">
  <img src="https://via.placeholder.com/1200x300/8b5cf6/ffffff?text=Chatify+Real-time+Chat+Application" />
</p>

<div align="center">

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge&logo=vercel)](https://chatify-zeta-nine.vercel.app)
![Stars](https://img.shields.io/github/stars/amiitdev/chatify?style=for-the-badge&logo=github)
![Forks](https://img.shields.io/github/forks/amiitdev/chatify?style=for-the-badge&logo=github)
![License](https://img.shields.io/github/license/amiitdev/chatify?style=for-the-badge)

</div>

<p align="center">
  <strong>A modern, full-stack real-time chat application with dark mode, image sharing, message interactions, and live user presence tracking.</strong>
</p>

---

## ✨ Features

| Feature | Description |
|----------|-------------|
| ⚡ Real-time Messaging | Instant message delivery using WebSockets |
| 🌙 Dark Mode | Beautiful, eye-friendly UI |
| 🖼️ Image Sharing | Send images up to 10MB |
| 💬 Reply to Messages | Thread-style conversations |
| 🗑️ Delete Messages | Remove messages permanently |
| 🟢 Online Users | Live presence indicator |
| ⌨️ Typing Indicators | See when someone is typing |
| 📱 Fully Responsive | Works on desktop, tablet & mobile |
| ✔ Message Status | Sent & delivered indicators |

---

# 🛠️ Tech Stack

## 🎨 Frontend

- **React** — UI Library
- **Vite** — Lightning-fast development server
- **Zustand** — Lightweight state management with persistence
- **Socket.io-client** — Real-time communication
- **CSS3** — Custom dark theme styling

## ⚙️ Backend

- **Node.js** — JavaScript runtime
- **Express.js** — REST API framework
- **Socket.io** — Real-time WebSocket server
- **CORS** — Cross-origin resource handling

---

# 📁 Project Structure

```
chatify/
│
├── client/                      # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBox.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── OnlineUsers.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   ├── ImageMessage.jsx
│   │   │   └── SmartMessage.jsx
│   │   │
│   │   ├── store/
│   │   │   └── chatStore.js
│   │   │
│   │   ├── utils/
│   │   │   └── storage.js
│   │   │
│   │   ├── hooks/
│   │   │   └── useKeyboard.js
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                      # Backend (Node + Express + Socket.io)
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md
```

---

# 🚀 Live Demo

🌐 **Production URL:**  
👉https://chatify-4vwv.vercel.app

---

# 💻 Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/amiitdev/chatify.git
cd chatify
```

---

## 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create `.env` file inside `server/`:

```
PORT=3000
```

Start backend:

```bash
npm start
```

Server runs on:

```
http://localhost:3000
```

---

## 3️⃣ Frontend Setup

```bash
cd client
npm install
```

Create `.env` file inside `client/`:

```
VITE_BACKEND_URL=http://localhost:3000
```

Start frontend:

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 📦 Production Build

```bash
cd client
npm run build
```

Production files will be generated inside:

```
client/dist/
```

You can deploy:

- Frontend → Vercel / Netlify
- Backend → Render / Railway / VPS

---

# 📡 API Documentation

## Health Check

```
GET /
```

**Response:**
```
Hello from the server!
```

---

# 🔌 Socket Events

| Event | Direction | Description |
|--------|-----------|-------------|
| userJoined | Client → Server | User joins chat |
| onlineUsers | Server → Client | Send online users list |
| privateMessage | Client → Server | Send message |
| receivePrivateMessage | Server → Client | Receive message |
| typing | Client → Server | User typing |
| showTyping | Server → Client | Show typing indicator |
| stopTyping | Client → Server | Stop typing |
| hideTyping | Server → Client | Hide typing indicator |
| deleteMessage | Client → Server | Delete request |
| messageDeleted | Server → Client | Confirm delete |
| userLogout | Client → Server | Logout event |
| disconnect | Server → Client | User disconnected |

---

# 📸 UI Preview

## Login Screen

```
┌─────────────────────────────────┐
│      Welcome to Chatify         │
│   ┌───────────────────────┐     │
│   │  Enter your name      │     │
│   └───────────────────────┘     │
│        ┌─────────────┐          │
│        │  Join Chat  │          │
│        └─────────────┘          │
└─────────────────────────────────┘
```

---

## Chat Interface

```
┌───────────────────────────────────────────────┐
│ ☰ Chatify        username               ⏻    │
├───────────────────────────────────────────────┤
│ Online Users │        Messages               │
│ 👤 John      │  Hello there! 10:30 AM        │
│ 👤 Sarah     │  Hi! How are you? ✓           │
│ 👤 Mike      │  [Image]                      │
├───────────────────────────────────────────────┤
│ Type a message...  📷   ➤                    │
└───────────────────────────────────────────────┘
```

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create feature branch  
   ```
   git checkout -b feature/AmazingFeature
   ```
3. Commit changes  
   ```
   git commit -m "Add AmazingFeature"
   ```
4. Push branch  
   ```
   git push origin feature/AmazingFeature
   ```
5. Open Pull Request

---

# 📄 License

Licensed under the MIT License.

---

# 👨‍💻 Author

**Amit Kumar**  
GitHub: https://github.com/amiitdev  
Project: https://github.com/amiitdev/chatify  
Live: https://chatify-4vwv.vercel.app  

---

# 🙏 Acknowledgments

- React Team  
- Socket.io Team  
- Vercel Hosting  
- Open Source Community  

---

<div align="center">

### 🚀 Built with ❤️ by Amit Kumar  
© 2026 Chatify. All Rights Reserved.

</div>

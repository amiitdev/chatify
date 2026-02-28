// import React, { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';
// import ChatBox from './components/ChatBox';
// import TypingIndicator from './components/TypingIndicator';
// import OnlineUsers from './components/OnlineUsers';
// import MessageList from './components/MessageList';

// const socket = io('http://localhost:3000');

// const App = () => {
//   const [username, setUsername] = useState('');
//   const [inputName, setInputName] = useState('');
//   const [typingUser, setTypingUser] = useState('');
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [messages, setMessages] = useState([]);

//   // When user officially joins
//   useEffect(() => {
//     if (!username) return;

//     socket.emit('userJoined', username);

//     const handleOnlineUsers = (users) => {
//       setOnlineUsers(users);
//     };

//     socket.on('onlineUsers', handleOnlineUsers);

//     return () => {
//       socket.off('onlineUsers', handleOnlineUsers);
//     };
//   }, [username]);

//   //sending messages
//   useEffect(() => {
//     const handleReceiveMessage = (data) => {
//       setMessages((prev) => [...prev, data]);
//     };

//     socket.on('receiveMessage', handleReceiveMessage);

//     return () => {
//       socket.off('receiveMessage', handleReceiveMessage);
//     };
//   }, []);

//   // Typing listeners
//   useEffect(() => {
//     const handleShowTyping = (name) => {
//       setTypingUser(name);
//     };

//     const handleHideTyping = () => {
//       setTypingUser('');
//     };

//     socket.on('showTyping', handleShowTyping);
//     socket.on('hideTyping', handleHideTyping);

//     return () => {
//       socket.off('showTyping', handleShowTyping);
//       socket.off('hideTyping', handleHideTyping);
//     };
//   }, []);

//   // If username not set → show login screen
//   if (!username) {
//     return (
//       <div style={{ padding: '20px' }}>
//         <h2>Enter Your Username</h2>
//         <input
//           type="text"
//           value={inputName}
//           onChange={(e) => setInputName(e.target.value)}
//           placeholder="Your name..."
//         />
//         <button
//           onClick={() => {
//             if (inputName.trim() !== '') {
//               setUsername(inputName);
//             }
//           }}
//         >
//           Join Chat
//         </button>
//       </div>
//     );
//   }

//   // Main Chat UI
//   return (
//     <>
//       <OnlineUsers users={onlineUsers} />
//       <MessageList messages={messages} username={username} />
//       <ChatBox socket={socket} username={username} />
//       <TypingIndicator typingUser={typingUser} />
//     </>
//   );
// };

// export default App;

// private message code////
// import React, { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';
// import ChatBox from './components/ChatBox';
// import TypingIndicator from './components/TypingIndicator';
// import OnlineUsers from './components/OnlineUsers';
// import MessageList from './components/MessageList';

// const socket = io('http://localhost:3000');

// const App = () => {
//   const [username, setUsername] = useState('');
//   const [inputName, setInputName] = useState('');
//   const [typingUser, setTypingUser] = useState('');
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [privateMessages, setPrivateMessages] = useState({});

//   // Receive private messages
//   useEffect(() => {
//     const handleReceivePrivateMessage = (data) => {
//       setPrivateMessages((prev) => {
//         const userMessages = prev[data.from] || [];
//         return {
//           ...prev,
//           [data.from]: [...userMessages, data],
//         };
//       });
//     };

//     socket.on('receivePrivateMessage', handleReceivePrivateMessage);

//     return () => {
//       socket.off('receivePrivateMessage', handleReceivePrivateMessage);
//     };
//   }, []);

//   // User joins
//   useEffect(() => {
//     if (!username) return;

//     socket.emit('userJoined', username);

//     const handleOnlineUsers = (users) => {
//       setOnlineUsers(users);
//     };

//     socket.on('onlineUsers', handleOnlineUsers);

//     return () => {
//       socket.off('onlineUsers', handleOnlineUsers);
//     };
//   }, [username]);

//   // Typing
//   useEffect(() => {
//     const handleShowTyping = (name) => setTypingUser(name);
//     const handleHideTyping = () => setTypingUser('');

//     socket.on('showTyping', handleShowTyping);
//     socket.on('hideTyping', handleHideTyping);

//     return () => {
//       socket.off('showTyping', handleShowTyping);
//       socket.off('hideTyping', handleHideTyping);
//     };
//   }, []);

//   // Login screen
//   if (!username) {
//     return (
//       <div style={{ padding: '20px' }}>
//         <h2>Enter Your Username</h2>
//         <input
//           value={inputName}
//           onChange={(e) => setInputName(e.target.value)}
//           placeholder="Your name..."
//         />
//         <button onClick={() => inputName.trim() && setUsername(inputName)}>
//           Join Chat
//         </button>
//       </div>
//     );
//   }

//   return (
//     <>
//       <OnlineUsers
//         users={onlineUsers}
//         selectUser={setSelectedUser}
//         selectedUser={selectedUser}
//         username={username}
//       />

//       {selectedUser && (
//         <MessageList
//           messages={privateMessages[selectedUser.username] || []}
//           username={username}
//         />
//       )}

//       <ChatBox
//         socket={socket}
//         username={username}
//         selectedUser={selectedUser}
//       />

//       <TypingIndicator typingUser={typingUser} />
//     </>
//   );
// };

// export default App;

// import React, { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';
// import ChatBox from './components/ChatBox';
// import TypingIndicator from './components/TypingIndicator';
// import OnlineUsers from './components/OnlineUsers';
// import MessageList from './components/MessageList';
// import './App.css';

// const socket = io('http://localhost:3000');

// const App = () => {
//   const [username, setUsername] = useState('');
//   const [inputName, setInputName] = useState('');
//   const [typingUser, setTypingUser] = useState('');
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   // When user officially joins
//   useEffect(() => {
//     if (!username) return;

//     socket.emit('userJoined', username);

//     const handleOnlineUsers = (users) => {
//       setOnlineUsers(users);
//     };

//     socket.on('onlineUsers', handleOnlineUsers);

//     return () => {
//       socket.off('onlineUsers', handleOnlineUsers);
//     };
//   }, [username]);

//   //sending messages
//   useEffect(() => {
//     const handleReceiveMessage = (data) => {
//       setMessages((prev) => [...prev, data]);
//     };

//     socket.on('receiveMessage', handleReceiveMessage);

//     return () => {
//       socket.off('receiveMessage', handleReceiveMessage);
//     };
//   }, []);

//   // Typing listeners
//   useEffect(() => {
//     const handleShowTyping = (name) => {
//       setTypingUser(name);
//     };

//     const handleHideTyping = () => {
//       setTypingUser('');
//     };

//     socket.on('showTyping', handleShowTyping);
//     socket.on('hideTyping', handleHideTyping);

//     return () => {
//       socket.off('showTyping', handleShowTyping);
//       socket.off('hideTyping', handleHideTyping);
//     };
//   }, []);

//   // Close sidebar when clicking outside on mobile
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (isSidebarOpen && window.innerWidth <= 768) {
//         const sidebar = document.querySelector('.sidebar');
//         const hamburger = document.querySelector('.hamburger-button');

//         if (
//           sidebar &&
//           !sidebar.contains(e.target) &&
//           !hamburger.contains(e.target)
//         ) {
//           setIsSidebarOpen(false);
//         }
//       }
//     };

//     document.addEventListener('click', handleClickOutside);
//     return () => document.removeEventListener('click', handleClickOutside);
//   }, [isSidebarOpen]);

//   // Close sidebar when a user is clicked (optional)
//   const handleUserClick = () => {
//     if (window.innerWidth <= 768) {
//       setIsSidebarOpen(false);
//     }
//   };

//   // If username not set → show login screen
//   if (!username) {
//     return (
//       <div className="login-container">
//         <div className="login-card">
//           <h1 className="login-title">💬 Chat App</h1>
//           <h2 className="login-subtitle">Enter Your Username</h2>
//           <input
//             type="text"
//             value={inputName}
//             onChange={(e) => setInputName(e.target.value)}
//             placeholder="Your name..."
//             className="login-input"
//             onKeyPress={(e) => {
//               if (e.key === 'Enter' && inputName.trim() !== '') {
//                 setUsername(inputName);
//               }
//             }}
//           />
//           <button
//             onClick={() => {
//               if (inputName.trim() !== '') {
//                 setUsername(inputName);
//               }
//             }}
//             className="login-button"
//             disabled={!inputName.trim()}
//           >
//             Join Chat
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Main Chat UI
//   return (
//     <div className="chat-app">
//       <header className="chat-header">
//         <div className="header-left">
//           <button
//             className={`hamburger-button ${isSidebarOpen ? 'open' : ''}`}
//             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//             aria-label="Toggle online users"
//           >
//             <span></span>
//             <span></span>
//             <span></span>
//           </button>
//           <h1 className="chat-title">💬 Chat Room</h1>
//         </div>

//         <div className="user-info">
//           <span className="user-badge">
//             <span className="online-dot"></span>
//             {username}
//             {onlineUsers.length > 0 && (
//               <span className="user-count-badge">{onlineUsers.length}</span>
//             )}
//           </span>
//         </div>
//       </header>

//       <div className="chat-container">
//         {/* Overlay for mobile when sidebar is open */}
//         {isSidebarOpen && (
//           <div
//             className="sidebar-overlay"
//             onClick={() => setIsSidebarOpen(false)}
//           />
//         )}

//         <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
//           <div className="sidebar-header">
//             <h3>Online Users</h3>
//             <button
//               className="close-sidebar"
//               onClick={() => setIsSidebarOpen(false)}
//               aria-label="Close sidebar"
//             >
//               ×
//             </button>
//           </div>
//           <OnlineUsers users={onlineUsers} onUserClick={handleUserClick} />
//         </aside>

//         <main className="main-content">
//           <MessageList messages={messages} username={username} />
//           <div className="typing-indicator-container">
//             <TypingIndicator typingUser={typingUser} />
//           </div>
//           <div className="chat-box-container">
//             <ChatBox socket={socket} username={username} />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default App;
//////////////////////////////////////////////////////////////////////////////////////////////////////
// import React from 'react';

// const TypingIndicator = ({ typingUser }) => {
//   return <div>{typingUser && <p>{typingUser} is typing...</p>}</div>;
// };

// export default TypingIndicator;
////////////////////////////////////////////////////////////////////////////////////////////////////////
// import React from 'react';

// const OnlineUsers = ({ users }) => {
//   return (
//     <div>
//       <h3>🟢 Online Users</h3>
//       {users.map((user) => (
//         <h4 key={user.socketId}>{user.username}</h4>
//       ))}
//     </div>
//   );
// };

// export default OnlineUsers;

//private message code
// import React from 'react';

// const OnlineUsers = ({ users, selectUser, selectedUser, username }) => {
//   return (
//     <div
//       style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px' }}
//     >
//       <h3>🟢 Online Users</h3>

//       {users.map((user) => {
//         const isCurrentUser = user.username === username;
//         const isSelected =
//           selectedUser && selectedUser.socketId === user.socketId;

//         return (
//           <div
//             key={user.socketId}
//             onClick={() => {
//               if (!isCurrentUser) selectUser(user);
//             }}
//             style={{
//               padding: '8px',
//               margin: '5px 0',
//               borderRadius: '8px',
//               cursor: isCurrentUser ? 'default' : 'pointer',
//               backgroundColor: isSelected
//                 ? '#d0ebff'
//                 : isCurrentUser
//                   ? '#f1f3f5'
//                   : '#ffffff',
//               fontWeight: isCurrentUser ? 'bold' : 'normal',
//               border: isSelected ? '1px solid #339af0' : '1px solid #ddd',
//             }}
//           >
//             {user.username}
//             {isCurrentUser && ' (You)'}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default OnlineUsers;

/////////////////////////////////////////////////////////////////////////////////////////////////////
// import React, { useEffect, useRef } from 'react';

// const MessageList = ({ messages, username }) => {
//   const messagesEndRef = useRef(null);
//   //auto scroll to bottom when new message arrives
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   return (
//     <div>
//       <h3>💬 Messages</h3>

//       {messages.map((msg, index) => (
//         <div
//           key={index}
//           style={{
//             textAlign: msg.username === username ? 'right' : 'left',
//             backgroundColor: msg.username === username ? '#7fa661' : '#FFF',
//             padding: '8px 12px',
//             borderRadius: '10px',
//             margin: '5px 0',
//             maxWidth: '60%',
//           }}
//         >
//           <strong>{msg.username}</strong>
//           <p style={{ margin: '5px 0' }}>{msg.message}</p>
//           <small style={{ fontSize: '10px', color: 'gray' }}>{msg.time}</small>
//         </div>
//       ))}

//       {/* 👇 Invisible div to scroll into */}
//       <div ref={messagesEndRef} />
//     </div>
//   );
// };

// export default MessageList;

/////private message code/////
// import React, { useEffect, useRef } from 'react';

// const MessageList = ({ messages, username }) => {
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   return (
//     <div>
//       <h3>💬 Messages</h3>

//       {messages.map((msg, index) => (
//         <div
//           key={index}
//           style={{
//             textAlign: msg.from === username ? 'right' : 'left',
//             backgroundColor: msg.from === username ? '#DCF8C6' : '#FFF',
//             padding: '8px',
//             borderRadius: '10px',
//             margin: '5px 0',
//             maxWidth: '60%',
//           }}
//         >
//           <strong>{msg.from}</strong>
//           <p>{msg.message}</p>
//           <small>{msg.time}</small>
//         </div>
//       ))}

//       <div ref={messagesEndRef} />
//     </div>
//   );
// };

// export default MessageList;
////////////////////////////////////////////////////////////////////////////////////////////////////
// import React from 'react';
// import { useState, useRef } from 'react';

// const ChatBox = ({ socket, username }) => {
//   const [message, setmessage] = useState('');

//   //send Message
//   const handleMessage = () => {
//     if (message.trim() === '') return;

//     const messageData = {
//       username,
//       message,
//       time: new Date().toLocaleTimeString(),
//     };

//     socket.emit('sendMessage', messageData);
//     setmessage('');
//     socket.emit('stopTyping');
//   };

//   // const username = 'Amit';
//   const typingTimeoutRef = useRef(null);

//   const handleTyping = (e) => {
//     setmessage(e.target.value);
//     socket.emit('typing', username);
//     //clear old timer
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }
//     //start new timer
//     typingTimeoutRef.current = setTimeout(() => {
//       socket.emit('stopTyping');
//     }, 1000);
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         value={message}
//         onChange={handleTyping}
//         placeholder="Type message..."
//       />
//       <button onClick={handleMessage}>Send</button>
//     </div>
//   );
// };

// export default ChatBox;

// private message code///
// import React, { useState, useRef } from 'react';

// const ChatBox = ({ socket, username, selectedUser }) => {
//   const [message, setMessage] = useState('');
//   const typingTimeoutRef = useRef(null);

//   const handleMessage = () => {
//     if (!message.trim()) return;
//     if (!selectedUser) {
//       alert('Select a user first');
//       return;
//     }

//     const messageData = {
//       to: selectedUser.socketId,
//       from: username,
//       message,
//       time: new Date().toLocaleTimeString(),
//     };

//     socket.emit('privateMessage', messageData);
//     setMessage('');
//     socket.emit('stopTyping');
//   };

//   const handleTyping = (e) => {
//     setMessage(e.target.value);
//     socket.emit('typing', username);

//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     typingTimeoutRef.current = setTimeout(() => {
//       socket.emit('stopTyping');
//     }, 1000);
//   };

//   return (
//     <div>
//       <h4>Chatting with: {selectedUser ? selectedUser.username : 'None'}</h4>

//       <input
//         value={message}
//         onChange={handleTyping}
//         placeholder="Type message..."
//       />

//       <button onClick={handleMessage}>Send</button>
//     </div>
//   );
// };

// export default ChatBox;

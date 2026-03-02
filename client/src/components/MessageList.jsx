// import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
// import { useChatStore } from '../store/chatStore';
// import './MessageList.css';
// import ImageMessage from './ImageMessage';
// import SmartMessage from './SmartMessage';
// // import Linkify from 'linkify-react';

// const MessageList = () => {
//   const { privateMessages, selectedUser, username } = useChatStore();
//   const messagesEndRef = useRef(null);
//   const containerRef = useRef(null);
//   const [showScrollButton, setShowScrollButton] = useState(false);
//   const [isAtBottom, setIsAtBottom] = useState(true);

//   // Get messages for selected user
//   const messages = useMemo(() => {
//     if (!selectedUser) return [];
//     return privateMessages[selectedUser.username] || [];
//   }, [privateMessages, selectedUser]);

//   // Group messages by date
//   const groupedMessages = useMemo(() => {
//     const groups = [];
//     let currentDate = null;

//     messages.forEach((msg, index) => {
//       const msgDate = new Date(
//         msg.timestamp || Date.now(),
//       ).toLocaleDateString();

//       if (msgDate !== currentDate) {
//         groups.push({
//           type: 'date',
//           date: msgDate,
//           id: `date-${msgDate}-${index}`,
//         });
//         currentDate = msgDate;
//       }

//       groups.push({
//         type: 'message',
//         ...msg,
//         id: msg.id || `msg-${index}-${msg.timestamp}`,
//       });
//     });

//     return groups;
//   }, [messages]);

//   // Group consecutive messages from same sender
//   const messageGroups = useMemo(() => {
//     const groups = [];
//     let currentGroup = null;

//     groupedMessages.forEach((item) => {
//       if (item.type === 'date') {
//         if (currentGroup) {
//           groups.push(currentGroup);
//           currentGroup = null;
//         }
//         groups.push(item);
//       } else {
//         if (!currentGroup || currentGroup.sender !== item.from) {
//           if (currentGroup) {
//             groups.push(currentGroup);
//           }
//           currentGroup = {
//             sender: item.from,
//             isOwn: item.from === username,
//             messages: [item],
//           };
//         } else {
//           currentGroup.messages.push(item);
//         }
//       }
//     });

//     if (currentGroup) {
//       groups.push(currentGroup);
//     }

//     return groups;
//   }, [groupedMessages, username]);

//   // Scroll to bottom
//   const scrollToBottom = useCallback(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, []);

//   // Check scroll position
//   const handleScroll = useCallback(() => {
//     if (!containerRef.current) return;

//     const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
//     const bottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
//     setIsAtBottom(bottom);
//     setShowScrollButton(!bottom && messages.length > 0);
//   }, [messages.length]);

//   // Auto-scroll on new messages if user was at bottom
//   useEffect(() => {
//     if (isAtBottom) {
//       scrollToBottom();
//     } else {
//       setShowScrollButton(true);
//     }
//   }, [messages, isAtBottom, scrollToBottom]);

//   // Add scroll listener
//   useEffect(() => {
//     const container = containerRef.current;
//     if (container) {
//       container.addEventListener('scroll', handleScroll);
//       return () => container.removeEventListener('scroll', handleScroll);
//     }
//   }, [handleScroll]);

//   // Format timestamp
//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp || Date.now());
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   // Format date for separator
//   const formatDate = (dateStr) => {
//     const today = new Date().toLocaleDateString();
//     const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

//     if (dateStr === today) return 'Today';
//     if (dateStr === yesterday) return 'Yesterday';
//     return dateStr;
//   };

//   // Get message status icon
//   const MessageStatus = ({ status }) => {
//     if (status === 'sending') {
//       return (
//         <span className="message-status sending">
//           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
//             <circle cx="12" cy="12" r="10" strokeWidth="2" />
//             <path d="M12 6v6l4 2" strokeWidth="2" />
//           </svg>
//         </span>
//       );
//     }

//     if (status === 'delivered') {
//       return (
//         <span className="message-status delivered">
//           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
//             <path d="M20 6L9 17l-5-5" strokeWidth="2" />
//           </svg>
//         </span>
//       );
//     }

//     if (status === 'read') {
//       return (
//         <span className="message-status read">
//           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
//             <path d="M18 6L7 17l-5-5M22 10l-7.5 7.5L22 10z" strokeWidth="2" />
//           </svg>
//         </span>
//       );
//     }

//     return null;
//   };

//   // Icons
//   const EmptyStateIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
//       <path
//         d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
//         strokeWidth="2"
//       />
//       <line x1="9" y1="10" x2="15" y2="10" strokeWidth="2" />
//     </svg>
//   );

//   const ScrollIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <polyline points="6 9 12 15 18 9" />
//     </svg>
//   );

//   const ReactionIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <circle cx="12" cy="12" r="10" />
//       <path d="M8 14s1.5 2 4 2 4-2 4-2" />
//       <line x1="9" y1="9" x2="9.01" y2="9" />
//       <line x1="15" y1="9" x2="15.01" y2="9" />
//     </svg>
//   );

//   const ReplyIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
//     </svg>
//   );

//   if (!selectedUser) {
//     return (
//       <div className="message-list-empty">
//         <EmptyStateIcon />
//         <h3>No conversation selected</h3>
//         <p>Choose a user from the sidebar to start chatting</p>
//       </div>
//     );
//   }

//   if (messages.length === 0) {
//     return (
//       <div className="message-list-empty">
//         <EmptyStateIcon />
//         <h3>Start a conversation</h3>
//         <p>Send a message to {selectedUser.username} to begin chatting</p>
//       </div>
//     );
//   }

//   return (
//     <div className="message-list-container" ref={containerRef}>
//       {messageGroups.map((group, index) => {
//         if (group.type === 'date') {
//           return (
//             <div key={group.id} className="message-date-separator">
//               <span>{formatDate(group.date)}</span>
//             </div>
//           );
//         }

//         return (
//           <div
//             key={`group-${index}`}
//             className={`message-group ${group.isOwn ? 'own-messages' : 'other-messages'}`}
//           >
//             {/* // In MessageList.jsx, update the message rendering section */}
//             {group.messages.map((msg, msgIndex) => (
//               <div key={msg.id || `msg-${msgIndex}`} className="message-item">
//                 <div className="message-bubble">
//                   {!group.isOwn && msgIndex === 0 && (
//                     <div className="message-header">
//                       <span className="message-sender">{group.sender}</span>
//                       <span className="message-time">
//                         {formatTime(msg.timestamp)}
//                       </span>
//                     </div>
//                   )}

//                   <div className="message-content">
//                     {msg.type === 'image' ? (
//                       <ImageMessage
//                         imageData={msg.message}
//                         fileName={msg.fileName}
//                         fileSize={msg.fileSize}
//                         mimeType={msg.mimeType}
//                         isOwn={group.isOwn}
//                       />
//                     ) : (
//                       <div className="text-message">
//                         <SmartMessage
//                           text={msg.message}
//                           className="linkified-text"
//                         />
//                       </div>
//                     )}
//                   </div>

//                   {group.isOwn && (
//                     <div className="message-footer">
//                       <span className="message-time">
//                         {formatTime(msg.timestamp)}
//                       </span>
//                       <MessageStatus status={msg.status || 'delivered'} />
//                     </div>
//                   )}
//                 </div>

//                 <div className="message-actions">
//                   <button className="message-action-btn" title="React">
//                     <ReactionIcon />
//                   </button>
//                   <button className="message-action-btn" title="Reply">
//                     <ReplyIcon />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         );
//       })}

//       <div ref={messagesEndRef} />

//       {showScrollButton && (
//         <button className="scroll-to-bottom" onClick={scrollToBottom}>
//           <ScrollIcon />
//         </button>
//       )}
//     </div>
//   );
// };

// export default MessageList;

//////////////////////////////////////

// import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
// import { useChatStore } from '../store/chatStore';
// import './MessageList.css';
// import ImageMessage from './ImageMessage';
// import SmartMessage from './SmartMessage';
// // import Linkify from 'linkify-react';

// const MessageList = () => {
//   const { privateMessages, selectedUser, username, deleteMessage } =
//     useChatStore(); // Add deleteMessage here
//   const messagesEndRef = useRef(null);
//   const containerRef = useRef(null);
//   const [showScrollButton, setShowScrollButton] = useState(false);
//   const [isAtBottom, setIsAtBottom] = useState(true);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // Track which message is being deleted

//   // Get messages for selected user
//   const messages = useMemo(() => {
//     if (!selectedUser) return [];
//     return privateMessages[selectedUser.username] || [];
//   }, [privateMessages, selectedUser]);

//   // Group messages by date
//   const groupedMessages = useMemo(() => {
//     const groups = [];
//     let currentDate = null;

//     messages.forEach((msg, index) => {
//       const msgDate = new Date(
//         msg.timestamp || Date.now(),
//       ).toLocaleDateString();

//       if (msgDate !== currentDate) {
//         groups.push({
//           type: 'date',
//           date: msgDate,
//           id: `date-${msgDate}-${index}`,
//         });
//         currentDate = msgDate;
//       }

//       groups.push({
//         type: 'message',
//         ...msg,
//         id: msg.id || `msg-${index}-${msg.timestamp}`,
//       });
//     });

//     return groups;
//   }, [messages]);

//   // Group consecutive messages from same sender
//   const messageGroups = useMemo(() => {
//     const groups = [];
//     let currentGroup = null;

//     groupedMessages.forEach((item) => {
//       if (item.type === 'date') {
//         if (currentGroup) {
//           groups.push(currentGroup);
//           currentGroup = null;
//         }
//         groups.push(item);
//       } else {
//         if (!currentGroup || currentGroup.sender !== item.from) {
//           if (currentGroup) {
//             groups.push(currentGroup);
//           }
//           currentGroup = {
//             sender: item.from,
//             isOwn: item.from === username,
//             messages: [item],
//           };
//         } else {
//           currentGroup.messages.push(item);
//         }
//       }
//     });

//     if (currentGroup) {
//       groups.push(currentGroup);
//     }

//     return groups;
//   }, [groupedMessages, username]);

//   // Scroll to bottom
//   const scrollToBottom = useCallback(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, []);

//   // Check scroll position
//   const handleScroll = useCallback(() => {
//     if (!containerRef.current) return;

//     const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
//     const bottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
//     setIsAtBottom(bottom);
//     setShowScrollButton(!bottom && messages.length > 0);
//   }, [messages.length]);

//   // Auto-scroll on new messages if user was at bottom
//   useEffect(() => {
//     if (isAtBottom) {
//       scrollToBottom();
//     } else {
//       setShowScrollButton(true);
//     }
//   }, [messages, isAtBottom, scrollToBottom]);

//   // Add scroll listener
//   useEffect(() => {
//     const container = containerRef.current;
//     if (container) {
//       container.addEventListener('scroll', handleScroll);
//       return () => container.removeEventListener('scroll', handleScroll);
//     }
//   }, [handleScroll]);

//   // Format timestamp
//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp || Date.now());
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   // Format date for separator
//   const formatDate = (dateStr) => {
//     const today = new Date().toLocaleDateString();
//     const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

//     if (dateStr === today) return 'Today';
//     if (dateStr === yesterday) return 'Yesterday';
//     return dateStr;
//   };

//   // Get message status icon
//   const MessageStatus = ({ status }) => {
//     if (status === 'sending') {
//       return (
//         <span className="message-status sending">
//           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
//             <circle cx="12" cy="12" r="10" strokeWidth="2" />
//             <path d="M12 6v6l4 2" strokeWidth="2" />
//           </svg>
//         </span>
//       );
//     }

//     if (status === 'delivered') {
//       return (
//         <span className="message-status delivered">
//           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
//             <path d="M20 6L9 17l-5-5" strokeWidth="2" />
//           </svg>
//         </span>
//       );
//     }

//     if (status === 'read') {
//       return (
//         <span className="message-status read">
//           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
//             <path d="M18 6L7 17l-5-5M22 10l-7.5 7.5L22 10z" strokeWidth="2" />
//           </svg>
//         </span>
//       );
//     }

//     return null;
//   };

//   // ========================
//   // NEW: Handle message deletion
//   // ========================
//   const handleDeleteClick = (messageId, e) => {
//     e.stopPropagation(); // Prevent event bubbling
//     setShowDeleteConfirm(messageId);
//   };

//   const handleConfirmDelete = (messageId) => {
//     deleteMessage(messageId);
//     setShowDeleteConfirm(null);
//   };

//   const handleCancelDelete = () => {
//     setShowDeleteConfirm(null);
//   };

//   // Icons
//   const EmptyStateIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
//       <path
//         d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
//         strokeWidth="2"
//       />
//       <line x1="9" y1="10" x2="15" y2="10" strokeWidth="2" />
//     </svg>
//   );

//   const ScrollIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <polyline points="6 9 12 15 18 9" />
//     </svg>
//   );

//   const ReactionIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <circle cx="12" cy="12" r="10" />
//       <path d="M8 14s1.5 2 4 2 4-2 4-2" />
//       <line x1="9" y1="9" x2="9.01" y2="9" />
//       <line x1="15" y1="9" x2="15.01" y2="9" />
//     </svg>
//   );

//   const ReplyIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
//     </svg>
//   );

//   const DeleteIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <polyline points="3 6 5 6 21 6" />
//       <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
//       <line x1="10" y1="11" x2="10" y2="17" />
//       <line x1="14" y1="11" x2="14" y2="17" />
//     </svg>
//   );

//   if (!selectedUser) {
//     return (
//       <div className="message-list-empty">
//         <EmptyStateIcon />
//         <h3>No conversation selected</h3>
//         <p>Choose a user from the sidebar to start chatting</p>
//       </div>
//     );
//   }

//   if (messages.length === 0) {
//     return (
//       <div className="message-list-empty">
//         <EmptyStateIcon />
//         <h3>Start a conversation</h3>
//         <p>Send a message to {selectedUser.username} to begin chatting</p>
//       </div>
//     );
//   }

//   return (
//     <div className="message-list-container" ref={containerRef}>
//       {messageGroups.map((group, index) => {
//         if (group.type === 'date') {
//           return (
//             <div key={group.id} className="message-date-separator">
//               <span>{formatDate(group.date)}</span>
//             </div>
//           );
//         }

//         return (
//           <div
//             key={`group-${index}`}
//             className={`message-group ${group.isOwn ? 'own-messages' : 'other-messages'}`}
//           >
//             {group.messages.map((msg, msgIndex) => (
//               <div key={msg.id || `msg-${msgIndex}`} className="message-item">
//                 <div className="message-bubble">
//                   {!group.isOwn && msgIndex === 0 && (
//                     <div className="message-header">
//                       <span className="message-sender">{group.sender}</span>
//                       <span className="message-time">
//                         {formatTime(msg.timestamp)}
//                       </span>
//                     </div>
//                   )}

//                   <div className="message-content">
//                     {msg.type === 'image' ? (
//                       <ImageMessage
//                         imageData={msg.message}
//                         fileName={msg.fileName}
//                         fileSize={msg.fileSize}
//                         mimeType={msg.mimeType}
//                         isOwn={group.isOwn}
//                       />
//                     ) : (
//                       <div className="text-message">
//                         {msg.deleted ? (
//                           <span className="deleted-message">{msg.message}</span>
//                         ) : (
//                           <SmartMessage
//                             text={msg.message}
//                             className="linkified-text"
//                           />
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   {(group.isOwn || msg.deleted) && (
//                     <div className="message-footer">
//                       <span className="message-time">
//                         {formatTime(msg.timestamp)}
//                       </span>
//                       {!msg.deleted && (
//                         <MessageStatus status={msg.status || 'delivered'} />
//                       )}
//                       {msg.deleted && msg.deletedBy && (
//                         <span className="deleted-by">
//                           {msg.deletedBy === username
//                             ? 'You deleted this message'
//                             : 'Message deleted'}
//                         </span>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* Message Actions */}
//                 {!msg.deleted && (
//                   <div className="message-actions">
//                     <button
//                       className="message-action-btn"
//                       title="React"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <ReactionIcon />
//                     </button>
//                     <button
//                       className="message-action-btn"
//                       title="Reply"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <ReplyIcon />
//                     </button>

//                     {/* Delete button - only for own messages */}
//                     {group.isOwn && (
//                       <button
//                         className="message-action-btn delete-btn"
//                         title="Delete"
//                         onClick={(e) => handleDeleteClick(msg.id, e)}
//                       >
//                         <DeleteIcon />
//                       </button>
//                     )}
//                   </div>
//                 )}

//                 {/* Delete Confirmation Modal */}
//                 {showDeleteConfirm === msg.id && (
//                   <div className="delete-confirm-overlay">
//                     <div className="delete-confirm-modal">
//                       <h4>Delete Message?</h4>
//                       <p>
//                         This message will be deleted for both you and the
//                         recipient.
//                       </p>
//                       <div className="delete-confirm-actions">
//                         <button
//                           className="delete-cancel-btn"
//                           onClick={handleCancelDelete}
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           className="delete-confirm-btn"
//                           onClick={() => handleConfirmDelete(msg.id)}
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         );
//       })}

//       <div ref={messagesEndRef} />

//       {showScrollButton && (
//         <button className="scroll-to-bottom" onClick={scrollToBottom}>
//           <ScrollIcon />
//         </button>
//       )}
//     </div>
//   );
// };

// export default MessageList;

///////////////////////////////////
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useChatStore } from '../store/chatStore';
import './MessageList.css';
import ImageMessage from './ImageMessage';
import SmartMessage from './SmartMessage';

const MessageList = () => {
  const {
    privateMessages,
    selectedUser,
    username,
    deleteMessage,
    setReplyingTo,
    replyingTo,
  } = useChatStore();

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Get messages for selected user
  const messages = useMemo(() => {
    if (!selectedUser) return [];
    return privateMessages[selectedUser.username] || [];
  }, [privateMessages, selectedUser]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;

    messages.forEach((msg, index) => {
      const msgDate = new Date(
        msg.timestamp || Date.now(),
      ).toLocaleDateString();

      if (msgDate !== currentDate) {
        groups.push({
          type: 'date',
          date: msgDate,
          id: `date-${msgDate}-${index}`,
        });
        currentDate = msgDate;
      }

      groups.push({
        type: 'message',
        ...msg,
        id: msg.id || `msg-${index}-${msg.timestamp}`,
      });
    });

    return groups;
  }, [messages]);

  // Group consecutive messages from same sender
  const messageGroups = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    groupedMessages.forEach((item) => {
      if (item.type === 'date') {
        if (currentGroup) {
          groups.push(currentGroup);
          currentGroup = null;
        }
        groups.push(item);
      } else {
        if (!currentGroup || currentGroup.sender !== item.from) {
          if (currentGroup) {
            groups.push(currentGroup);
          }
          currentGroup = {
            sender: item.from,
            isOwn: item.from === username,
            messages: [item],
          };
        } else {
          currentGroup.messages.push(item);
        }
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [groupedMessages, username]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Check scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const bottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
    setIsAtBottom(bottom);
    setShowScrollButton(!bottom && messages.length > 0);
  }, [messages.length]);

  // Auto-scroll on new messages if user was at bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    } else {
      setShowScrollButton(true);
    }
  }, [messages, isAtBottom, scrollToBottom]);

  // Add scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp || Date.now());
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for separator
  const formatDate = (dateStr) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return dateStr;
  };

  // Get message status icon
  const MessageStatus = ({ status }) => {
    if (status === 'sending') {
      return (
        <span className="message-status sending">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M12 6v6l4 2" strokeWidth="2" />
          </svg>
        </span>
      );
    }

    if (status === 'delivered') {
      return (
        <span className="message-status delivered">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 6L9 17l-5-5" strokeWidth="2" />
          </svg>
        </span>
      );
    }

    if (status === 'read') {
      return (
        <span className="message-status read">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L7 17l-5-5M22 10l-7.5 7.5L22 10z" strokeWidth="2" />
          </svg>
        </span>
      );
    }

    return null;
  };

  // ========================
  // Handle message deletion
  // ========================
  const handleDeleteClick = (messageId, e) => {
    e.stopPropagation();
    setShowDeleteConfirm(messageId);
  };

  const handleConfirmDelete = (messageId) => {
    deleteMessage(messageId);
    setShowDeleteConfirm(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  // ========================
  // NEW: Handle reply
  // ========================
  const handleReplyClick = (message, e) => {
    e.stopPropagation();
    setReplyingTo(message);
    // Focus on input (you'll need to pass a ref to ChatBox or use a global method)
    document.querySelector('.chat-input')?.focus();
  };

  // ========================
  // NEW: Reply Preview Component
  // ========================
  const ReplyPreview = ({ replyTo, isOwn }) => {
    if (!replyTo) return null;

    return (
      <div className={`reply-preview ${isOwn ? 'own-reply' : 'other-reply'}`}>
        <div className="reply-line"></div>
        <div className="reply-content">
          <span className="reply-sender">
            {replyTo.from === username ? 'You' : replyTo.from}
          </span>
          <span className="reply-message">
            {replyTo.type === 'image'
              ? '📷 Image'
              : replyTo.message.substring(0, 50)}
            {replyTo.message.length > 50 ? '...' : ''}
          </span>
        </div>
      </div>
    );
  };

  // Icons
  const EmptyStateIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        strokeWidth="2"
      />
      <line x1="9" y1="10" x2="15" y2="10" strokeWidth="2" />
    </svg>
  );

  const ScrollIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  const ReactionIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );

  const ReplyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );

  const DeleteIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );

  if (!selectedUser) {
    return (
      <div className="message-list-empty">
        <EmptyStateIcon />
        <h3>No conversation selected</h3>
        <p>Choose a user from the sidebar to start chatting</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="message-list-empty">
        <EmptyStateIcon />
        <h3>Start a conversation</h3>
        <p>Send a message to {selectedUser.username} to begin chatting</p>
      </div>
    );
  }

  return (
    <div className="message-list-container" ref={containerRef}>
      {messageGroups.map((group, index) => {
        if (group.type === 'date') {
          return (
            <div key={group.id} className="message-date-separator">
              <span>{formatDate(group.date)}</span>
            </div>
          );
        }

        return (
          <div
            key={`group-${index}`}
            className={`message-group ${group.isOwn ? 'own-messages' : 'other-messages'}`}
          >
            {group.messages.map((msg, msgIndex) => (
              <div key={msg.id || `msg-${msgIndex}`} className="message-item">
                <div className="message-bubble">
                  {/* Reply Preview */}
                  {msg.replyTo && (
                    <ReplyPreview replyTo={msg.replyTo} isOwn={group.isOwn} />
                  )}

                  {!group.isOwn && msgIndex === 0 && (
                    <div className="message-header">
                      <span className="message-sender">{group.sender}</span>
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  )}

                  <div className="message-content">
                    {msg.type === 'image' ? (
                      <ImageMessage
                        imageData={msg.message}
                        fileName={msg.fileName}
                        fileSize={msg.fileSize}
                        mimeType={msg.mimeType}
                        isOwn={group.isOwn}
                      />
                    ) : (
                      <div className="text-message">
                        {msg.deleted ? (
                          <span className="deleted-message">{msg.message}</span>
                        ) : (
                          <SmartMessage
                            text={msg.message}
                            className="linkified-text"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {(group.isOwn || msg.deleted) && (
                    <div className="message-footer">
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                      {!msg.deleted && (
                        <MessageStatus status={msg.status || 'delivered'} />
                      )}
                      {msg.deleted && msg.deletedBy && (
                        <span className="deleted-by">
                          {msg.deletedBy === username
                            ? 'You deleted this message'
                            : 'Message deleted'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Message Actions */}
                {!msg.deleted && (
                  <div className="message-actions">
                    <button
                      className="message-action-btn"
                      title="React"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ReactionIcon />
                    </button>

                    {/* NEW: Reply button */}
                    <button
                      className="message-action-btn reply-btn"
                      title="Reply"
                      onClick={(e) => handleReplyClick(msg, e)}
                    >
                      <ReplyIcon />
                    </button>

                    {/* Delete button - only for own messages */}
                    {group.isOwn && (
                      <button
                        className="message-action-btn delete-btn"
                        title="Delete"
                        onClick={(e) => handleDeleteClick(msg.id, e)}
                      >
                        <DeleteIcon />
                      </button>
                    )}
                  </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm === msg.id && (
                  <div className="delete-confirm-overlay">
                    <div className="delete-confirm-modal">
                      <h4>Delete Message?</h4>
                      <p>
                        This message will be deleted for both you and the
                        recipient.
                      </p>
                      <div className="delete-confirm-actions">
                        <button
                          className="delete-cancel-btn"
                          onClick={handleCancelDelete}
                        >
                          Cancel
                        </button>
                        <button
                          className="delete-confirm-btn"
                          onClick={() => handleConfirmDelete(msg.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}

      <div ref={messagesEndRef} />

      {showScrollButton && (
        <button className="scroll-to-bottom" onClick={scrollToBottom}>
          <ScrollIcon />
        </button>
      )}
    </div>
  );
};

export default MessageList;

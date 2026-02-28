// import { useEffect, useState, useMemo } from 'react';
// import { useChatStore } from '../store/chatStore';
// import './TypingIndicator.css';

// const TypingIndicator = ({ variant = 'default' }) => {
//   const { typingUsers, selectedUser, username } = useChatStore();
//   const [typingTimeout, setTypingTimeout] = useState(null);

//   // Filter typing users for current chat context
//   const relevantTypingUsers = useMemo(() => {
//     if (!selectedUser || !typingUsers || typingUsers.length === 0) return [];

//     // Filter users that are typing in this conversation
//     // This assumes your typingUsers array includes the recipient info
//     return typingUsers.filter(
//       (user) =>
//         user.username !== username && user.recipient === selectedUser.username, // If you have this structure
//     );
//   }, [typingUsers, selectedUser, username]);

//   // For backward compatibility with single typingUser
//   const { typingUser } = useChatStore();

//   // Auto-hide after timeout (fallback)
//   useEffect(() => {
//     if (relevantTypingUsers.length > 0 || typingUser) {
//       if (typingTimeout) clearTimeout(typingTimeout);

//       const timeout = setTimeout(() => {
//         // This is just a fallback - your store should handle this
//       }, 3000);

//       setTypingTimeout(timeout);
//     }

//     return () => {
//       if (typingTimeout) clearTimeout(typingTimeout);
//     };
//   }, [relevantTypingUsers, typingUser]);

//   // Get user initials for avatar
//   const getInitials = (name) => {
//     return name
//       .split(' ')
//       .map((word) => word[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   // Get avatar color based on username
//   const getAvatarColor = (username) => {
//     const colors = [
//       'linear-gradient(135deg, #6b4eff, #9b7fff)',
//       'linear-gradient(135deg, #ff4e8a, #ff7b9c)',
//       'linear-gradient(135deg, #4ecdc4, #6ee7db)',
//       'linear-gradient(135deg, #ffb347, #ffd966)',
//     ];

//     let hash = 0;
//     for (let i = 0; i < username.length; i++) {
//       hash = username.charCodeAt(i) + ((hash << 5) - hash);
//     }

//     return colors[Math.abs(hash) % colors.length];
//   };

//   // Format typing text based on number of users
//   const getTypingText = () => {
//     if (relevantTypingUsers.length > 0) {
//       if (relevantTypingUsers.length === 1) {
//         return (
//           <div className="typing-info">
//             <span className="typing-name">
//               {relevantTypingUsers[0].username}
//             </span>
//             <span className="typing-text">
//               is typing
//               <span className="typing-dots">
//                 <span></span>
//                 <span></span>
//                 <span></span>
//               </span>
//             </span>
//           </div>
//         );
//       } else if (relevantTypingUsers.length === 2) {
//         return (
//           <div className="typing-info">
//             <span className="typing-text">
//               <span className="typing-name">
//                 {relevantTypingUsers[0].username}
//               </span>{' '}
//               and
//               <span className="typing-name">
//                 {' '}
//                 {relevantTypingUsers[1].username}
//               </span>{' '}
//               are typing
//               <span className="typing-dots">
//                 <span></span>
//                 <span></span>
//                 <span></span>
//               </span>
//             </span>
//           </div>
//         );
//       } else {
//         return (
//           <div className="typing-info">
//             <span className="typing-text">
//               Several people are typing
//               <span className="typing-dots">
//                 <span></span>
//                 <span></span>
//                 <span></span>
//               </span>
//             </span>
//           </div>
//         );
//       }
//     } else if (typingUser) {
//       // Legacy support
//       return (
//         <div className="typing-info">
//           <span className="typing-name">{typingUser}</span>
//           <span className="typing-text">
//             is typing
//             <span className="typing-dots">
//               <span></span>
//               <span></span>
//               <span></span>
//             </span>
//           </span>
//         </div>
//       );
//     }

//     return null;
//   };

//   // Multiple typing users view
//   const renderMultipleTyping = () => {
//     return (
//       <div className="typing-multiple">
//         <div className="typing-users-list">
//           {relevantTypingUsers.map((user, index) => (
//             <div key={user.socketId || index} className="typing-user-chip">
//               <span className="user-dot" />
//               <span>{user.username}</span>
//               <span className="typing-dots">
//                 <span></span>
//                 <span></span>
//                 <span></span>
//               </span>
//             </div>
//           ))}
//           {relevantTypingUsers.length > 2 && (
//             <div className="typing-user-chip">
//               <span>+{relevantTypingUsers.length - 2} more</span>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Different variants
//   const renderVariant = () => {
//     const typingText = getTypingText();
//     if (!typingText) return null;

//     switch (variant) {
//       case 'compact':
//         return (
//           <div className="typing-indicator-compact">
//             <div className="typing-dots">
//               <span></span>
//               <span></span>
//               <span></span>
//             </div>
//             <span className="typing-text">
//               {relevantTypingUsers.length > 0
//                 ? relevantTypingUsers[0].username
//                 : typingUser}{' '}
//               is typing...
//             </span>
//           </div>
//         );

//       case 'floating':
//         return (
//           <div className="typing-indicator-floating">
//             <div className="typing-content">
//               <div className="typing-avatar">
//                 {relevantTypingUsers.length > 0
//                   ? getInitials(relevantTypingUsers[0].username)
//                   : getInitials(typingUser || '')}
//               </div>
//               {typingText}
//             </div>
//           </div>
//         );

//       case 'multiple':
//         return relevantTypingUsers.length > 1 ? (
//           renderMultipleTyping()
//         ) : (
//           <div className="typing-indicator-container">
//             <div className="typing-content">
//               <div className="typing-avatar">
//                 {relevantTypingUsers.length > 0
//                   ? getInitials(relevantTypingUsers[0].username)
//                   : getInitials(typingUser || '')}
//               </div>
//               {typingText}
//             </div>
//           </div>
//         );

//       default:
//         return (
//           <div className="typing-indicator-container">
//             <div className="typing-content">
//               <div className="typing-avatar">
//                 {relevantTypingUsers.length > 0
//                   ? getInitials(relevantTypingUsers[0].username)
//                   : getInitials(typingUser || '')}
//               </div>
//               {typingText}
//             </div>
//           </div>
//         );
//     }
//   };

//   // Don't render if no one is typing
//   if ((!typingUser && relevantTypingUsers.length === 0) || !selectedUser) {
//     return null;
//   }

//   return renderVariant();
// };

// export default TypingIndicator;

import { useChatStore } from '../store/chatStore';
import './TypingIndicator.css';

const TypingIndicator = () => {
  const { typingUser, selectedUser } = useChatStore();

  if (!selectedUser) return null;

  if (!typingUser) return null;

  // Only show if it's the currently selected user
  if (typingUser !== selectedUser.username) return null;

  return (
    <div className="typing-indicator-container">
      <div className="typing-content">
        <span className="typing-name">{typingUser}</span>
        <span className="typing-text">
          is typing
          <span className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useChatStore } from '../store/chatStore';
import './MessageList.css';
import ImageMessage from './ImageMessage';
import SmartMessage from './SmartMessage';
// import Linkify from 'linkify-react';

const MessageList = () => {
  const { privateMessages, selectedUser, username } = useChatStore();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

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
            {/* // In MessageList.jsx, update the message rendering section */}
            {group.messages.map((msg, msgIndex) => (
              <div key={msg.id || `msg-${msgIndex}`} className="message-item">
                <div className="message-bubble">
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
                        <SmartMessage
                          text={msg.message}
                          className="linkified-text"
                        />
                      </div>
                    )}
                  </div>

                  {group.isOwn && (
                    <div className="message-footer">
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                      <MessageStatus status={msg.status || 'delivered'} />
                    </div>
                  )}
                </div>

                <div className="message-actions">
                  <button className="message-action-btn" title="React">
                    <ReactionIcon />
                  </button>
                  <button className="message-action-btn" title="Reply">
                    <ReplyIcon />
                  </button>
                </div>
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

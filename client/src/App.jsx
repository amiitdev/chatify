import { useEffect, useState } from 'react';
import { useChatStore } from './store/chatStore';
import ChatBox from './components/ChatBox';
import TypingIndicator from './components/TypingIndicator';
import OnlineUsers from './components/OnlineUsers';
import MessageList from './components/MessageList';
import './App.css';

const App = () => {
  const { username, setUsername, initSocketListeners, error, logout } =
    useChatStore();
  const [inputName, setInputName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Initialize socket listeners only once
  useEffect(() => {
    initSocketListeners();
  }, [initSocketListeners]);

  // Auto-fill input if username exists in storage but not in state
  useEffect(() => {
    // This helps if user refreshes but we want to show their name
    const savedUsername = localStorage.getItem('chat_username');
    if (savedUsername) {
      try {
        const parsed = JSON.parse(savedUsername);
        setInputName(parsed);
      } catch {
        setInputName(savedUsername);
      }
    }
  }, []);

  // Rest of your existing effects (resize, click outside, escape key, body scroll)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMenuOpen &&
        !e.target.closest('.sidebar') &&
        !e.target.closest('.mobile-header .hamburger')
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleJoinChat = async () => {
    const trimmedName = inputName.trim();
    if (!trimmedName) return;

    setIsJoining(true);
    try {
      await setUsername(trimmedName);
    } catch (err) {
      console.error('Failed to join chat:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputName.trim() && !isJoining) {
      handleJoinChat();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleUserSelect = () => {
    if (window.innerWidth <= 768) {
      closeMenu();
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setInputName('');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Icons
  const HamburgerIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );

  const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  const LogoutIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  if (!username) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>Welcome to Chat</h2>
          <p>Enter your name to join</p>
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your name"
            maxLength={50}
            disabled={isJoining}
            autoFocus
          />
          {error && <div className="error-message">{error}</div>}
          <button
            disabled={!inputName.trim() || isJoining}
            onClick={handleJoinChat}
            className={isJoining ? 'loading' : ''}
          >
            {isJoining ? 'Joining...' : 'Join Chat'}
          </button>

          {/* Show saved session hint */}
          {inputName && !isJoining && (
            <p className="login-hint">Press Enter or click Join Chat</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-app">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Logout</h3>
            <p>
              Are you sure you want to logout? Your chat history will be saved.
            </p>
            <div className="modal-actions">
              <button onClick={cancelLogout} className="cancel-btn">
                Cancel
              </button>
              <button onClick={confirmLogout} className="confirm-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      <div
        className={`menu-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={closeMenu}
      />

      {/* Sidebar - contains online users */}
      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button
            className="hamburger"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
          <h2>Chatify</h2>
          <span className="user-name" title={username}>
            {username}
          </span>
          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            <LogoutIcon />
          </button>
        </div>
        <OnlineUsers onUserSelect={handleUserSelect} />
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button
            className="hamburger"
            onClick={toggleMenu}
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </button>
          <h2>Chat</h2>
          <span className="user-name" title={username}>
            {username}
          </span>
          <button
            className="logout-button mobile"
            onClick={handleLogout}
            title="Logout"
          >
            <LogoutIcon />
          </button>
        </div>

        <MessageList />
        <TypingIndicator />
        <ChatBox />
      </main>
    </div>
  );
};

export default App;

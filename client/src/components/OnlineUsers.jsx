import { useState, useMemo, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import './OnlineUsers.css'; // If you want separate CSS file

const OnlineUsers = () => {
  const { onlineUsers, setSelectedUser, username, selectedUser } =
    useChatStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Filter out current user and apply search
  const otherUsers = useMemo(() => {
    const filtered = onlineUsers.filter((user) => user.username !== username);

    if (searchTerm.trim()) {
      return filtered.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }, [onlineUsers, username, searchTerm]);

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random gradient color based on username
  const getAvatarColor = (username) => {
    const colors = [
      'linear-gradient(135deg, #6b4eff, #9b7fff)',
      'linear-gradient(135deg, #ff4e8a, #ff7b9c)',
      'linear-gradient(135deg, #4ecdc4, #6ee7db)',
      'linear-gradient(135deg, #ffb347, #ffd966)',
      'linear-gradient(135deg, #a78bfa, #c4b5fd)',
    ];

    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const handleUserSelect = useCallback(
    (user) => {
      setIsLoading(true);
      // Simulate loading (remove this in production)
      setTimeout(() => {
        setSelectedUser(user);
        setIsLoading(false);
      }, 300);
    },
    [setSelectedUser],
  );

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Icons as components
  const SearchIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );

  const ClearIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  const EmptyStateIcon = () => (
    <svg
      width="60"
      height="60"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="8" y1="15" x2="16" y2="15"></line>
      <line x1="9" y1="9" x2="9.01" y2="9"></line>
      <line x1="15" y1="9" x2="15.01" y2="9"></line>
    </svg>
  );

  return (
    <div className="online-users-container">
      <div className="online-users-header">
        <h3>Online Users</h3>
        <div className="online-stats">
          <div className="online-count">
            <span>{otherUsers.length}</span> online
          </div>
        </div>
      </div>

      <div className="online-users-search">
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            style={{ paddingRight: searchTerm ? '40px' : '16px' }}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#6b6b7c',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <ClearIcon />
            </button>
          )}
        </div>
      </div>

      <div className="online-users-list">
        {isLoading && (
          <div className="online-users-loading">
            <div className="loading-spinner"></div>
          </div>
        )}

        {!isLoading && otherUsers.length === 0 && (
          <div className="no-users-found">
            <EmptyStateIcon />
            {searchTerm ? (
              <>
                <p>No users found</p>
                <p className="hint">Try a different search term</p>
              </>
            ) : (
              <>
                <p>No other users online</p>
                <p className="hint">Invite friends to chat!</p>
              </>
            )}
          </div>
        )}

        {!isLoading &&
          otherUsers.map((user) => (
            <div
              key={user.socketId}
              className={`online-user-item ${
                selectedUser?.socketId === user.socketId ? 'selected' : ''
              }`}
              onClick={() => handleUserSelect(user)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleUserSelect(user);
                }
              }}
            >
              <div
                className="user-avatar"
                style={{ background: getAvatarColor(user.username) }}
              >
                {getInitials(user.username)}
              </div>
              <div className="user-info">
                <div
                  className="user-name"
                  data-tooltip={
                    user.username.length > 20 ? user.username : undefined
                  }
                >
                  {user.username}
                </div>
                <div className="user-status">
                  <span className="user-status-dot"></span>
                  Online
                </div>
                {/* Optional: Add last active time if you have this data */}
                {/* <div className="user-last-active">Active now</div> */}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default OnlineUsers;

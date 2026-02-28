// Storage keys constants
export const STORAGE_KEYS = {
  USERNAME: 'chat_username',
  SELECTED_USER: 'chat_selected_user',
};

// Generic save function (for username and selected user)
export const saveToStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`);
    return false;
  }
};

// Generic load function (for username and selected user)
export const loadFromStorage = (key) => {
  try {
    const serializedData = localStorage.getItem(key);
    return serializedData ? JSON.parse(serializedData) : null;
  } catch (error) {
    console.error(`Error loading from localStorage: ${error}`);
    return null;
  }
};

// Get user-specific message storage key
const getMessagesKey = (username) => {
  return `chat_messages_${username}`;
};

// Save messages for specific user
export const saveMessagesToStorage = (username, messages) => {
  if (!username) return false;
  try {
    const key = getMessagesKey(username);
    const serializedData = JSON.stringify(messages);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error(`Error saving messages to localStorage: ${error}`);
    return false;
  }
};

// Load messages for specific user
export const loadMessagesFromStorage = (username) => {
  if (!username) return {};
  try {
    const key = getMessagesKey(username);
    const serializedData = localStorage.getItem(key);
    return serializedData ? JSON.parse(serializedData) : {};
  } catch (error) {
    console.error(`Error loading messages from localStorage: ${error}`);
    return {};
  }
};

// Clear messages for specific user (on logout)
export const clearUserMessages = (username) => {
  if (!username) return;
  try {
    const key = getMessagesKey(username);
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing user messages: ${error}`);
  }
};

// Clear session data only (keep messages)
export const clearSessionData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_USER);
  } catch (error) {
    console.error(`Error clearing session data: ${error}`);
  }
};

// Legacy function - only use if you want to clear everything
export const clearAllChatData = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error(`Error clearing chat data: ${error}`);
  }
};

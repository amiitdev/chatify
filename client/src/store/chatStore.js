import { create } from 'zustand';
import { io } from 'socket.io-client';
import {
  saveToStorage,
  loadFromStorage,
  saveMessagesToStorage,
  loadMessagesFromStorage,
  clearSessionData,
  STORAGE_KEYS,
} from '../utils/storage';

// Create socket outside store (singleton)
const socket = io('http://localhost:3000', {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  maxHttpBufferSize: 1e7, // Increase buffer size for larger messages (10MB)
});

// Helper function to generate unique message ID
const generateMessageId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 4)}`;
};

export const useChatStore = create((set, get) => {
  // ========================
  // LOAD INITIAL STATE FROM STORAGE
  // ========================

  const savedUsername = loadFromStorage(STORAGE_KEYS.USERNAME) || '';
  const savedMessages = savedUsername
    ? loadMessagesFromStorage(savedUsername)
    : {};
  const savedSelectedUser = loadFromStorage(STORAGE_KEYS.SELECTED_USER) || null;

  // Track processed message IDs
  const processedMessageIds = new Set();

  // Track image chunks for reconstruction
  const imageChunksMap = new Map(); // Use Map instead of state for better performance

  return {
    username: savedUsername,
    selectedUser: savedSelectedUser,
    onlineUsers: [],
    typingUser: '',
    privateMessages: savedMessages,
    isSocketInitialized: false,
    imageReconstructionProgress: {}, // Track progress for UI

    // ========================
    // ACTIONS
    // ========================

    setUsername: (name) => {
      // Save username to storage
      saveToStorage(STORAGE_KEYS.USERNAME, name);

      // Load messages for this user
      const userMessages = loadMessagesFromStorage(name);

      set({
        username: name,
        privateMessages: userMessages,
      });

      // Ensure socket is connected before emitting
      if (socket.connected) {
        console.log('Socket already connected, emitting userJoined');
        socket.emit('userJoined', name);
      } else {
        console.log('Socket not connected, waiting for connection');
        socket.off('connect');
        socket.on('connect', () => {
          console.log('Socket connected now, emitting userJoined');
          socket.emit('userJoined', name);
        });
        if (!socket.connected) {
          socket.connect();
        }
      }
    },

    setSelectedUser: (user) => {
      saveToStorage(STORAGE_KEYS.SELECTED_USER, user);
      set({ selectedUser: user });
    },

    // ========================
    // FIXED: sendMessage function
    // ========================
    sendMessage: (message, type = 'text', fileData = null) => {
      const { username, selectedUser, privateMessages } = get();

      if ((!message && type === 'text') || !selectedUser) return;
      if (type === 'image' && !fileData) return;

      const messageId = generateMessageId();

      // Prepare the message data based on type
      let messageContent = message;
      let additionalData = {};

      if (type === 'image') {
        // For images, message contains the base64 data
        messageContent = fileData.data || message;
        additionalData = {
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
          mimeType: fileData.mimeType,
          type: 'image',
        };
      } else if (type === 'image-chunk') {
        // For image chunks, message is the chunk data
        additionalData = {
          type: 'image-chunk',
        };
      } else if (type === 'image-metadata') {
        additionalData = {
          type: 'image-metadata',
        };
      } else {
        additionalData = {
          type: 'text',
        };
      }

      const messageData = {
        id: messageId,
        to: selectedUser.socketId,
        toUsername: selectedUser.username,
        from: username,
        message: messageContent,
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now(),
        status: 'sent',
        ...additionalData,
      };

      processedMessageIds.add(messageId);

      // Send to server
      socket.emit('privateMessage', messageData);
      console.log('📤 Sending message:', { type, to: selectedUser.username });

      // ========================
      // IMPORTANT: Add to sender's messages immediately
      // This is what makes the sender see their own messages
      // ========================
      if (type === 'image' || type === 'text') {
        const partner = selectedUser.username;
        const existing = privateMessages[partner] || [];

        // For images, ensure we have the data properly formatted
        let messageToAdd = messageData;
        if (type === 'image' && fileData) {
          messageToAdd = {
            ...messageData,
            message: fileData.data || message, // Ensure base64 is included
          };
        }

        const updatedMessages = {
          ...privateMessages,
          [partner]: [...existing, messageToAdd],
        };

        set({ privateMessages: updatedMessages });
        saveMessagesToStorage(username, updatedMessages);
      }

      socket.emit('stopTyping', { toUsername: selectedUser.username });
    },

    initSocketListeners: () => {
      const { isSocketInitialized, username } = get();

      if (isSocketInitialized) return;

      // Remove old listeners
      socket.off('receivePrivateMessage');
      socket.off('onlineUsers');
      socket.off('showTyping');
      socket.off('hideTyping');
      socket.off('connect');
      socket.off('disconnect');

      // Handle socket connection
      socket.on('connect', () => {
        console.log('Socket connected with ID:', socket.id);

        const { username } = get();
        if (username) {
          console.log('Re-registering user after reconnect:', username);
          socket.emit('userJoined', username);
        }
      });

      // Handle socket disconnection
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      // RECEIVE MESSAGE - UPDATED WITH CHUNK HANDLING
      socket.on('receivePrivateMessage', (data) => {
        const { privateMessages, username, selectedUser } = get();

        console.log('Received message:', data.type || 'text', data);

        // Only process messages for current user
        if (data.toUsername && data.toUsername !== username) {
          console.log('Message not for current user, ignoring');
          return;
        }

        // Ignore own messages
        if (data.from === username) {
          console.log('Ignoring own message');
          return;
        }

        // ========================
        // HANDLE IMAGE CHUNKS
        // ========================
        if (data.type === 'image-chunk') {
          try {
            // Parse chunk data if it's a string
            const chunkData =
              typeof data.message === 'string'
                ? JSON.parse(data.message)
                : data.message;

            console.log(
              `📦 Received chunk ${chunkData.chunkIndex + 1}/${chunkData.totalChunks} for ${chunkData.fileName}`,
            );

            // Create a unique key for this image (from + filename)
            const imageKey = `${data.from}-${chunkData.fileName}`;

            // Get existing chunks for this image
            if (!imageChunksMap.has(imageKey)) {
              imageChunksMap.set(imageKey, {
                chunks: new Array(chunkData.totalChunks),
                totalChunks: chunkData.totalChunks,
                fileName: chunkData.fileName,
                fileSize: chunkData.fileSize,
                mimeType: chunkData.mimeType,
                from: data.from,
                timestamp: data.timestamp || Date.now(),
                time: data.time,
              });
            }

            const imageData = imageChunksMap.get(imageKey);

            // Store the chunk at the correct index
            imageData.chunks[chunkData.chunkIndex] = chunkData.chunk;

            // Calculate progress
            const receivedChunks = imageData.chunks.filter(
              (c) => c !== undefined,
            ).length;
            const progress = Math.round(
              (receivedChunks / imageData.totalChunks) * 100,
            );

            // Update progress in state for UI
            set((state) => ({
              imageReconstructionProgress: {
                ...state.imageReconstructionProgress,
                [imageKey]: progress,
              },
            }));

            console.log(
              `📊 Progress: ${progress}% (${receivedChunks}/${imageData.totalChunks})`,
            );

            // Check if we have all chunks
            if (receivedChunks === imageData.totalChunks) {
              console.log('✅ All chunks received, reconstructing image...');

              // Reconstruct the full base64
              let fullBase64 = '';
              for (let i = 0; i < imageData.totalChunks; i++) {
                fullBase64 += imageData.chunks[i];
              }

              // Create the final image message
              const imageMessage = {
                id: generateMessageId(),
                from: imageData.from,
                message: `data:${imageData.mimeType};base64,${fullBase64}`,
                type: 'image',
                fileName: imageData.fileName,
                fileSize: imageData.fileSize,
                mimeType: imageData.mimeType,
                timestamp: imageData.timestamp,
                time:
                  imageData.time ||
                  new Date(imageData.timestamp).toLocaleTimeString(),
                status: 'delivered',
              };

              // Add to messages
              const partner = imageData.from;
              const existing = privateMessages[partner] || [];

              const updatedMessages = {
                ...privateMessages,
                [partner]: [...existing, imageMessage],
              };

              set({
                privateMessages: updatedMessages,
                imageReconstructionProgress: {
                  ...get().imageReconstructionProgress,
                  [imageKey]: 100,
                },
              });

              // Save messages
              saveMessagesToStorage(username, updatedMessages);

              // Clean up chunks map after 5 seconds
              setTimeout(() => {
                imageChunksMap.delete(imageKey);
                set((state) => {
                  const { [imageKey]: _, ...rest } =
                    state.imageReconstructionProgress;
                  return { imageReconstructionProgress: rest };
                });
              }, 5000);

              console.log('🎉 Image reconstructed and added to messages');
            }
          } catch (error) {
            console.error('Error processing image chunk:', error);
          }
          return;
        }

        // ========================
        // HANDLE IMAGE METADATA
        // ========================
        if (data.type === 'image-metadata') {
          try {
            const metadata =
              typeof data.message === 'string'
                ? JSON.parse(data.message)
                : data.message;

            console.log('📋 Received image metadata:', metadata);
            // Just log for now, we don't need to do anything with metadata
          } catch (error) {
            console.error('Error processing image metadata:', error);
          }
          return;
        }

        // ========================
        // HANDLE REGULAR MESSAGES (TEXT & COMPLETE IMAGES)
        // ========================

        // Check for duplicates
        if (processedMessageIds.has(data.id)) {
          console.log('Duplicate message prevented:', data.id);
          return;
        }

        processedMessageIds.add(data.id);

        const partner = data.from;

        if (!partner) {
          console.warn('No partner found for message');
          return;
        }

        const existing = privateMessages[partner] || [];
        const messageExists = existing.some((msg) => msg.id === data.id);

        if (!messageExists) {
          const updatedMessages = {
            ...privateMessages,
            [partner]: [...existing, data],
          };

          set({ privateMessages: updatedMessages });

          // Save messages for THIS user only
          saveMessagesToStorage(username, updatedMessages);

          console.log(
            `✅ New ${data.type || 'text'} message from ${partner} added`,
          );
        }

        // Clean up processed IDs
        if (processedMessageIds.size > 1000) {
          const idsArray = Array.from(processedMessageIds);
          processedMessageIds.clear();
          idsArray.slice(-500).forEach((id) => processedMessageIds.add(id));
        }
      });

      // ONLINE USERS
      socket.on('onlineUsers', (users) => {
        const { username, selectedUser } = get();
        console.log(
          'Online users received:',
          users.map((u) => u.username),
        );

        // Filter out current user
        const filtered = users.filter((u) => u.username !== username);
        set({ onlineUsers: filtered });

        if (selectedUser) {
          const updatedSelectedUser = users.find(
            (u) => u.username === selectedUser.username,
          );

          if (updatedSelectedUser) {
            set({ selectedUser: updatedSelectedUser });
            saveToStorage(STORAGE_KEYS.SELECTED_USER, updatedSelectedUser);
          }
        }
      });

      // TYPING EVENTS
      socket.on('showTyping', (name) => {
        const { selectedUser } = get();

        if (!selectedUser) return;

        if (name === selectedUser.username) {
          set({ typingUser: name });
        }
      });

      socket.on('hideTyping', () => {
        set({ typingUser: '' });
      });

      set({ isSocketInitialized: true });

      // If we already have a username, register
      if (username) {
        if (socket.connected) {
          socket.emit('userJoined', username);
        } else {
          socket.once('connect', () => {
            socket.emit('userJoined', username);
          });
        }
      }
    },

    emitTyping: () => {
      const { username, selectedUser } = get();
      if (!selectedUser) return;

      socket.emit('typing', {
        from: username,
        toUsername: selectedUser.username,
      });
    },

    emitStopTyping: () => {
      const { selectedUser } = get();
      if (!selectedUser) return;

      socket.emit('stopTyping', {
        toUsername: selectedUser.username,
      });
    },

    logout: () => {
      const { username } = get();

      // Notify server that user is logging out
      if (username && socket.connected) {
        console.log('Logging out user:', username);
        socket.emit('userLogout', username);
      }

      // Clear local session data
      clearSessionData();

      // Clear image chunks map
      imageChunksMap.clear();

      // Reset state
      set({
        username: '',
        selectedUser: null,
        onlineUsers: [],
        typingUser: '',
        privateMessages: {},
        imageReconstructionProgress: {},
      });

      processedMessageIds.clear();
    },

    clearChatWithUser: (usernameToClear) => {
      const { privateMessages, username } = get();
      const { [usernameToClear]: _, ...remainingMessages } = privateMessages;

      set({ privateMessages: remainingMessages });

      // Save for THIS user only
      saveMessagesToStorage(username, remainingMessages);
    },

    // Helper to get reconstruction progress for UI
    getReconstructionProgress: (imageKey) => {
      return get().imageReconstructionProgress[imageKey] || 0;
    },
  };
});

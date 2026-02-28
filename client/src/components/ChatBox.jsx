import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import './ChatBox.css';

const ChatBox = () => {
  const { sendMessage, selectedUser, emitTyping, emitStopTyping } =
    useChatStore();

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const MAX_MESSAGE_LENGTH = 500;
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

  // Auto-focus input when user is selected
  useEffect(() => {
    if (selectedUser && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedUser]);

  // Cleanup image preview on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        emitStopTyping();
      }
    };
  }, [imagePreview, emitStopTyping]);

  const handleTyping = useCallback(
    (e) => {
      const value = e.target.value;

      if (value.length <= MAX_MESSAGE_LENGTH) {
        setMessage(value);
        setCharCount(value.length);
      }

      if (!isTyping && value.length > 0) {
        setIsTyping(true);
        emitTyping();
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          emitStopTyping();
        }
        typingTimeoutRef.current = null;
      }, 1000);
    },
    [isTyping, emitTyping, emitStopTyping],
  );

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size - now up to 10MB
    if (file.size > MAX_IMAGE_SIZE) {
      setUploadError(
        `Image size should be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
      );
      return;
    }

    // Warn if file is large
    if (file.size > 5 * 1024 * 1024) {
      const confirmUpload = window.confirm(
        `Image size is ${(file.size / (1024 * 1024)).toFixed(1)}MB. ` +
          'Large images may take a moment to process. Continue?',
      );
      if (!confirmUpload) {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }

    setSelectedImage(file);
    setUploadProgress(0);

    // Create preview using createObjectURL for better performance
    try {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } catch (error) {
      console.error('Error creating preview:', error);
      // Fallback to FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.onerror = () => {
        setUploadError('Failed to create image preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = async (file) => {
    // Don't compress if file is already small enough
    if (file.size <= 3 * 1024 * 1024) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate scale to reduce size
          const maxDimension = 1600;
          let scale = 1;

          if (width > height && width > maxDimension) {
            scale = maxDimension / width;
          } else if (height > maxDimension) {
            scale = maxDimension / height;
          }

          width = Math.round(width * scale);
          height = Math.round(height * scale);

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Adjust quality based on file size
          let quality = 0.9;
          if (file.size > 8 * 1024 * 1024) quality = 0.7;
          else if (file.size > 5 * 1024 * 1024) quality = 0.8;

          canvas.toBlob(
            (blob) => {
              if (blob) {
                console.log(
                  `Compressed from ${(file.size / (1024 * 1024)).toFixed(1)}MB to ${(blob.size / (1024 * 1024)).toFixed(1)}MB`,
                );
                resolve(new File([blob], file.name, { type: file.type }));
              } else {
                resolve(file);
              }
            },
            file.type,
            quality,
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const splitBase64IntoChunks = (base64String, chunkSize = 500000) => {
    // 500KB chunks
    const chunks = [];
    for (let i = 0; i < base64String.length; i += chunkSize) {
      chunks.push(base64String.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const handleSendImage = async () => {
    if (!selectedImage || !selectedUser || isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Compress if needed
      const imageToSend = await compressImage(selectedImage);

      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const base64Data = event.target.result;

          // Check if base64 data is too large (WebSocket has limits)
          if (base64Data.length > 1000000) {
            // If > ~1MB as string
            console.log('Large image detected, splitting into chunks');

            // Split the base64 data (remove data URL prefix for chunks)
            const base64Parts = base64Data.split(',');
            const mimeType = base64Parts[0].match(/:(.*?);/)[1];
            const base64Content = base64Parts[1];

            // Split into chunks
            const chunks = splitBase64IntoChunks(base64Content);

            // Send metadata first
            const imageMetadata = {
              totalChunks: chunks.length,
              fileName: imageToSend.name,
              fileSize: imageToSend.size,
              mimeType: mimeType,
              originalSize: selectedImage.size,
              compressedSize: imageToSend.size,
            };

            // Send each chunk with progress update
            for (let i = 0; i < chunks.length; i++) {
              const progress = Math.round(((i + 1) / chunks.length) * 100);
              setUploadProgress(progress);

              const chunkData = {
                chunkIndex: i,
                totalChunks: chunks.length,
                chunk: chunks[i],
                fileName: imageToSend.name,
                fileSize: imageToSend.size,
                mimeType: mimeType,
                isLastChunk: i === chunks.length - 1,
              };

              // Send as separate messages with type 'image-chunk'
              sendMessage(JSON.stringify(chunkData), 'image-chunk');

              // Small delay to prevent overwhelming the connection
              if (i < chunks.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 50));
              }
            }

            // Send final metadata message
            sendMessage(JSON.stringify(imageMetadata), 'image-metadata');
          } else {
            // Small image, send normally
            const imageData = {
              data: base64Data,
              fileName: imageToSend.name,
              fileSize: imageToSend.size,
              mimeType: imageToSend.type,
            };

            sendMessage(base64Data, 'image', imageData);
            setUploadProgress(100);
          }

          // Clear image selection
          clearImageSelection();
        } catch (error) {
          console.error('Error processing image:', error);
          setUploadError('Failed to process image');
        }
      };

      reader.onerror = () => {
        setUploadError('Failed to read image file');
      };

      reader.onprogress = (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 50,
          ); // First 50% for reading
          setUploadProgress(progress);
        }
      };

      reader.readAsDataURL(imageToSend);
    } catch (error) {
      console.error('Failed to send image:', error);
      setUploadError('Failed to send image. Please try again.');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();

    if (!selectedUser) return;

    if (selectedImage) {
      handleSendImage();
    } else if (trimmedMessage) {
      sendMessage(trimmedMessage, 'text');

      setMessage('');
      setCharCount(0);

      if (isTyping) {
        setIsTyping(false);
        emitStopTyping();
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      inputRef.current?.focus();
    }
  }, [
    message,
    selectedUser,
    selectedImage,
    sendMessage,
    isTyping,
    emitStopTyping,
  ]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !selectedImage) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend, selectedImage],
  );

  const removeSelectedImage = () => {
    clearImageSelection();
  };

  const getPlaceholderText = () => {
    if (!selectedUser) return 'Select a user to start chatting';
    if (selectedImage) return 'Add a caption (optional)...';
    return `Message ${selectedUser.username || selectedUser}...`;
  };

  // Icons
  const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );

  const LockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );

  const ImageIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  );

  const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  if (!selectedUser) {
    return (
      <div className="no-user-selected">
        <LockIcon />
        <span>Select a user to start messaging</span>
      </div>
    );
  }

  return (
    <div className="chat-box-container">
      {/* Image preview area */}
      {imagePreview && (
        <div className="image-preview-container">
          <img
            src={imagePreview}
            alt="Preview"
            className="image-preview-thumb"
          />
          <button
            className="remove-image-btn"
            onClick={removeSelectedImage}
            disabled={isUploading}
          >
            <CloseIcon />
          </button>
          <div className="image-preview-details">
            <span className="image-preview-name">{selectedImage?.name}</span>
            <span className="image-preview-size">
              ({(selectedImage?.size / (1024 * 1024)).toFixed(1)}MB)
            </span>
          </div>

          {/* Upload progress bar */}
          {isUploading && (
            <div className="upload-progress">
              <div
                className="upload-progress-bar"
                style={{ width: `${uploadProgress}%` }}
              />
              <span className="upload-progress-text">{uploadProgress}%</span>
            </div>
          )}

          {/* Upload error */}
          {uploadError && <div className="upload-error">{uploadError}</div>}
        </div>
      )}

      <div className="chat-box-wrapper">
        <div className="chat-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className={`chat-input ${isTyping ? 'typing-active' : ''}`}
            value={message}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholderText()}
            disabled={!selectedUser || isUploading}
            maxLength={MAX_MESSAGE_LENGTH}
            aria-label="Message input"
          />

          {/* Image upload button */}
          <button
            className={`image-upload-btn ${isUploading ? 'uploading' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedUser || isUploading || selectedImage}
            title={selectedImage ? 'Image selected' : 'Send image (up to 10MB)'}
          >
            <ImageIcon />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />

          <span
            className={`typing-indicator-dot ${isTyping ? 'visible' : ''}`}
          />

          {message.length > 0 && (
            <span className="message-count">
              {message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          )}
        </div>

        <button
          className="chat-send-button"
          onClick={handleSend}
          disabled={
            (!message.trim() && !selectedImage) || !selectedUser || isUploading
          }
          aria-label="Send message"
        >
          {isUploading ? (
            <span className="upload-percentage">{uploadProgress}%</span>
          ) : (
            <SendIcon />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;

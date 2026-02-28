import { useState, useEffect } from 'react';
import './ImageMessage.css';

const ImageMessage = ({ imageData, fileName, fileSize, mimeType, isOwn }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [receivedChunks, setReceivedChunks] = useState({});

  useEffect(() => {
    // Reset states when imageData changes
    setIsLoading(true);
    setHasError(false);

    if (!imageData) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    try {
      // Check if this is chunked image data
      if (typeof imageData === 'string' && imageData.includes('"chunkIndex"')) {
        try {
          const chunkData = JSON.parse(imageData);

          if (chunkData.chunkIndex !== undefined) {
            // Store chunk
            setReceivedChunks((prev) => ({
              ...prev,
              [chunkData.fileName]: {
                ...prev[chunkData.fileName],
                chunks: {
                  ...(prev[chunkData.fileName]?.chunks || {}),
                  [chunkData.chunkIndex]: chunkData.chunk,
                },
                totalChunks: chunkData.totalChunks,
                fileName: chunkData.fileName,
                mimeType: chunkData.mimeType,
              },
            }));

            // If all chunks received, reconstruct image
            const fileData = receivedChunks[chunkData.fileName];
            if (
              fileData &&
              Object.keys(fileData.chunks).length === fileData.totalChunks
            ) {
              // Reconstruct base64
              let fullBase64 = '';
              for (let i = 0; i < fileData.totalChunks; i++) {
                fullBase64 += fileData.chunks[i];
              }

              const src = `data:${fileData.mimeType};base64,${fullBase64}`;
              setImageSrc(src);
            }

            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Not chunked data, continue normal processing
        }
      }

      // Normal image processing
      let src = null;

      if (typeof imageData === 'string') {
        if (imageData.startsWith('data:image')) {
          src = imageData;
        } else if (imageData.startsWith('/9j/')) {
          src = `data:image/jpeg;base64,${imageData}`;
        } else if (imageData.startsWith('iVBOR')) {
          src = `data:image/png;base64,${imageData}`;
        } else if (imageData.startsWith('R0lGOD')) {
          src = `data:image/gif;base64,${imageData}`;
        } else if (imageData.startsWith('UklGR')) {
          src = `data:image/webp;base64,${imageData}`;
        } else if (imageData.match(/^[A-Za-z0-9+/=]+$/)) {
          const mime = mimeType || 'image/jpeg';
          src = `data:${mime};base64,${imageData}`;
        } else {
          src = imageData;
        }
      }

      if (src) {
        setImageSrc(src);
      } else {
        throw new Error('Invalid image data');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [imageData, mimeType]);

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', e);
    setIsLoading(false);
    setHasError(true);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDownload = async () => {
    try {
      if (!imageSrc) return;

      // For large images, use canvas to create download
      const link = document.createElement('a');
      link.href = imageSrc;

      let extension = 'jpg';
      if (mimeType) {
        extension = mimeType.split('/')[1] || 'jpg';
      } else if (fileName) {
        const ext = fileName.split('.').pop();
        if (ext) extension = ext;
      }

      const downloadName = fileName || `image.${extension}`;
      if (!downloadName.includes('.')) {
        link.download = `${downloadName}.${extension}`;
      } else {
        link.download = downloadName;
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getFileExtension = () => {
    if (fileName) {
      const ext = fileName.split('.').pop();
      if (ext) return ext.toUpperCase();
    }
    if (mimeType) {
      return mimeType.split('/')[1].toUpperCase();
    }
    return 'IMAGE';
  };

  if (hasError) {
    return (
      <div className={`image-message ${isOwn ? 'own-image' : 'other-image'}`}>
        <div className="image-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>
          <span>Failed to load {getFileExtension()} image</span>
          {fileName && <span className="file-name">{fileName}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={`image-message ${isOwn ? 'own-image' : 'other-image'}`}>
      <div className="image-container">
        {isLoading && (
          <div className="image-loading">
            <div className="spinner"></div>
            <span>Loading {getFileExtension()} image...</span>
          </div>
        )}

        {imageSrc && (
          <img
            src={imageSrc}
            alt={fileName || 'Shared image'}
            className={`image-preview ${isExpanded ? 'expanded' : ''}`}
            onClick={toggleExpand}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        )}

        <div className="image-overlay">
          <button
            className="image-action-btn"
            onClick={toggleExpand}
            title="Expand"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M15 3h6v6M14 10L21 3M3 15h6v6M3 21L10 14"
                strokeWidth="2"
              />
            </svg>
          </button>

          <button
            className="image-action-btn"
            onClick={handleDownload}
            title="Download"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>

        {(fileName || fileSize) && (
          <div className="image-info">
            {fileName && (
              <span className="file-name" title={fileName}>
                {fileName.length > 20
                  ? fileName.substring(0, 17) + '...'
                  : fileName}
              </span>
            )}
            {fileSize && (
              <span className="file-size">{formatFileSize(fileSize)}</span>
            )}
          </div>
        )}
      </div>

      {/* Expanded view modal */}
      {isExpanded && imageSrc && (
        <div className="image-expanded-overlay" onClick={toggleExpand}>
          <div
            className="image-expanded-container"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={imageSrc} alt={fileName} className="image-expanded" />
            <button className="close-expanded" onClick={toggleExpand}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
                <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
              </svg>
            </button>
            <div className="image-expanded-info">
              <span>{fileName || 'Image'}</span>
              {fileSize && <span>{formatFileSize(fileSize)}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageMessage;

import React, { useMemo } from 'react';
import Linkify from 'linkify-react';

const SmartMessage = ({ text = '' }) => {
  const extractYouTubeId = (url) => {
    const regExp =
      /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([^&]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const youtubeIds = useMemo(() => {
    if (!text) return [];

    const youtubeRegex =
      /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([^\s&]+)/g;

    const matches = [...text.matchAll(youtubeRegex)];

    return matches.map((match) => extractYouTubeId(match[0])).filter(Boolean);
  }, [text]);

  return (
    <div className="smart-message">
      <Linkify
        options={{
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'chat-link', // 🔥 styling only applied to links
        }}
      >
        {text}
      </Linkify>

      {youtubeIds.map((id, index) => (
        <div key={index} className="youtube-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            title={`YouTube video ${index}`}
            frameBorder="0"
            allowFullScreen
          />
        </div>
      ))}
    </div>
  );
};

export default SmartMessage;

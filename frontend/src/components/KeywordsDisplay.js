import React, { useState, useEffect } from 'react';
import './KeywordsDisplay.css';

const KeywordsDisplay = ({ keywords, sentiment }) => {
  const [animatedKeywords, setAnimatedKeywords] = useState([]);

  useEffect(() => {
    if (keywords && keywords.length > 0) {
      const newKeywords = keywords.map((keyword, index) => ({
        text: keyword,
        delay: index * 0.1,
        size: Math.random() * 0.5 + 0.8,
        rotation: (Math.random() - 0.5) * 10,
        id: `${keyword}-${Date.now()}-${index}`
      }));
      setAnimatedKeywords(newKeywords);
    } else {
      setAnimatedKeywords([]);
    }
  }, [keywords]);

  const getKeywordColor = (index, total) => {
    if (sentiment === null || sentiment === undefined) {
      return 'var(--keyword-neutral)';
    }
    
    if (sentiment > 0) {
      const warmth = (index / total) * 0.3 + 0.7;
      return `hsl(${20 - sentiment * 20}, 80%, ${65 - warmth * 10}%)`;
    } else if (sentiment < 0) {
      const coldness = (index / total) * 0.3 + 0.7;
      return `hsl(${240 + sentiment * 20}, 70%, ${60 - coldness * 10}%)`;
    }
    return 'var(--keyword-neutral)';
  };

  if (!keywords || keywords.length === 0) {
    return (
      <div className="keywords-display empty">
        <p className="no-keywords">No keywords yet...</p>
      </div>
    );
  }

  return (
    <div className="keywords-display">
      <h3>Your Keywords</h3>
      <div className="keywords-cloud">
        {animatedKeywords.map((item, index) => (
          <span
            key={item.id}
            className="keyword-bubble"
            style={{
              animationDelay: `${item.delay}s`,
              fontSize: `${item.size}rem`,
              transform: `rotate(${item.rotation}deg)`,
              backgroundColor: getKeywordColor(index, animatedKeywords.length),
            }}
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default KeywordsDisplay;


import React, { useEffect, useRef } from 'react';
import './SentimentHistory.css';

const SentimentHistory = ({ history }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !history || history.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const midY = height / 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    if (history.length > 1) {
      const step = width / (history.length - 1);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(56, 239, 125, 0.3)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(245, 87, 108, 0.3)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, midY);

      history.forEach((item, index) => {
        const x = index * step;
        const y = midY - (item.sentiment * (height / 2));
        if (index === 0) {
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.lineTo(width, midY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();

      history.forEach((item, index) => {
        const x = index * step;
        const y = midY - (item.sentiment * (height / 2));
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      history.forEach((item, index) => {
        const x = index * step;
        const y = midY - (item.sentiment * (height / 2));

        ctx.fillStyle = item.sentiment > 0 
          ? 'rgba(56, 239, 125, 1)' 
          : item.sentiment < 0 
          ? 'rgba(245, 87, 108, 1)' 
          : 'rgba(255, 255, 255, 1)';
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('+1.0', 5, 15);
    ctx.fillText('0.0', 5, midY + 5);
    ctx.fillText('-1.0', 5, height - 5);

  }, [history]);

  if (!history || history.length === 0) {
    return (
      <div className="sentiment-history empty">
        <p className="no-history">Trends</p>
      </div>
    );
  }

  return (
    <div className="sentiment-history">
      <h3>Sentiment Trend</h3>
      <div className="history-chart">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="history-canvas"
        />
      </div>
      <div className="history-stats">
        <div className="stat">
          <span className="stat-label">Total Analyses:</span>
          <span className="stat-value">{history.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Average:</span>
          <span className="stat-value">
            {(history.reduce((sum, item) => sum + item.sentiment, 0) / history.length).toFixed(2)}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Latest:</span>
          <span className={`stat-value ${
            history[history.length - 1].sentiment > 0 ? 'positive' : 
            history[history.length - 1].sentiment < 0 ? 'negative' : 'neutral'
          }`}>
            {history[history.length - 1].sentiment.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SentimentHistory;


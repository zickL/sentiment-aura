import React from 'react';
import './Controls.css';

const Controls = ({ 
  isRecording, 
  onStartRecording, 
  onStopRecording,
  hasTranscript,
  onAnalyze,
  onClear
}) => {
  return (
    <div className="controls-panel">
      <div className="main-controls">
        <button
          className={`control-btn record-btn ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={false}
        >
          {isRecording ? (
            <>
              <span className="btn-icon">⏹️</span>
              <span className="btn-text">Stop</span>
            </>
          ) : (
            <>
              <span className="btn-icon">▶️</span>
              <span className="btn-text">Start</span>
            </>
          )}
        </button>

        {hasTranscript && !isRecording && (
          <button
            className="control-btn analyze-btn"
            onClick={onAnalyze}
          >
            <span className="btn-icon">📊</span>
            <span className="btn-text">Analyze Sentiment</span>
          </button>
        )}

        {hasTranscript && !isRecording && (
          <button
            className="control-btn clear-btn"
            onClick={onClear}
          >
            <span className="btn-icon">🗑️</span>
            <span className="btn-text">Clear</span>
          </button>
        )}
      </div>

      {isRecording && (
        <div className="status-indicator">
          <div className="status-wave">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
          <span className="status-text">Listening to your voice...</span>
        </div>
      )}
    </div>
  );
};

export default Controls;


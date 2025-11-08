import React, { useEffect, useRef } from 'react';
import './TranscriptDisplay.css';

const TranscriptDisplay = ({ transcript, isRecording }) => {
  const transcriptRef = useRef(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="transcript-display">
      <div className="transcript-header">
        <h3>Transcription</h3>
        {isRecording && (
          <div className="recording-badge">
            <span className="pulse-dot"></span>
            Recording...
          </div>
        )}
      </div>
      
      <div 
        ref={transcriptRef}
        className="transcript-content"
      >
        {transcript ? (
          <p className="transcript-text">{transcript}</p>
        ) : (
          <p className="transcript-placeholder">
            {isRecording 
              ? 'Listening... Start speaking!'
              : 'Click "Start Recording" to begin'}
          </p>
        )}
      </div>
      
      {transcript && (
        <div className="transcript-footer">
          <span className="char-count">{transcript.length} characters</span>
        </div>
      )}
    </div>
  );
};

export default TranscriptDisplay;


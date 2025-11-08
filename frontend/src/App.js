import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import P5Canvas from './P5Canvas';
import RecordingWave from './components/RecordingWave';
import InitialWave from './components/InitialWave';
import TranscriptDisplay from './components/TranscriptDisplay';
import KeywordsDisplay from './components/KeywordsDisplay';
import Controls from './components/Controls';
import SentimentHistory from './components/SentimentHistory';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [sentimentResult, setSentimentResult] = useState(null);
  const [sentimentHistory, setSentimentHistory] = useState([]); 
  
  const mediaRecorderRef = useRef(null);
  const websocketRef = useRef(null);
  const streamRef = useRef(null);
  const finalTranscriptRef = useRef(''); 
  const silenceTimerRef = useRef(null); 
  const AUTO_STOP_DELAY = 3000; 

  const DEEPGRAM_API_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY;
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const startRecording = async () => {
    try {
      setError('');
      setTranscript('');
      setSentimentResult(null);
      finalTranscriptRef.current = ''; 
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });
      
      streamRef.current = stream;
      console.log('microphone access success!');

      const wsUrl = `wss://api.deepgram.com/v1/listen?language=en-US&punctuate=true&interim_results=true`;
      const ws = new WebSocket(wsUrl, ['token', DEEPGRAM_API_KEY]);
      
      console.log('Connecting to Deepgram WebSocket...');
      
      websocketRef.current = ws;

      // build MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          console.log('Sending audio data:', event.data.size, 'bytes');
          const arrayBuffer = await event.data.arrayBuffer();
          ws.send(arrayBuffer);
        } else if (event.data.size > 0) {
          console.warn('WebSocket not ready (state:', ws.readyState, '), buffering...');
        }
      };

      ws.onopen = () => {
        console.log('Deepgram WebSocket connection successful!');
        console.log('starting recording...');
        mediaRecorder.start(250);
        setIsRecording(true);
      };

      ws.onmessage = async (message) => {
        const received = JSON.parse(message.data);
        console.log('Received Deepgram message:', received); 
        
        const transcriptText = received.channel?.alternatives?.[0]?.transcript;
        const isFinal = received.is_final;
        
        if (transcriptText && transcriptText.length > 0) {
          console.log('Real-time transcription:', transcriptText, '| is_final:', isFinal);
          
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          
          silenceTimerRef.current = setTimeout(() => {
            console.log('3 seconds of silence detected, stopping recording...');
            stopRecording();
          }, AUTO_STOP_DELAY);
          
          if (isFinal) {
            finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + transcriptText;
            setTranscript(finalTranscriptRef.current);
            
            console.log('Detected complete sentence, sending to backend for analysis...');
            try {
              const response = await fetch(`${BACKEND_URL}/process_text`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: transcriptText })
              });

              const data = await response.json();
              if (response.ok && data.sentiment !== undefined && data.keywords) {
                console.log('Backend returned AI analysis result:', data);
                console.log('  - sentiment score:', data.sentiment);
                console.log('  - keywords:', data.keywords);
                setSentimentResult(data);
                setSentimentHistory(prev => [...prev, {
                  sentiment: data.sentiment,
                  keywords: data.keywords,
                  timestamp: Date.now(),
                  text: transcriptText.substring(0, 50)
                }]);
              } else {
                console.error('Backend returned error:', response.status, data);
                setError(data.error || 'AI analysis failed');
              }
            } catch (err) {
              console.error('Failed to send to backend:', err);
            }
          } else {
            const displayText = finalTranscriptRef.current + (finalTranscriptRef.current ? ' ' : '') + transcriptText;
            setTranscript(displayText);
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed.');
      };
      
    } catch (err) {
      console.error('Error:', err);
      setError(`error: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.close();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
    console.log('Recording stopped.');
  };

  const sendToBackend = async () => {
    if (!transcript.trim()) {
      setError('No text to send.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/process_text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcript })
      });

      const data = await response.json();
      console.log('Backend returned:', data);
      
      if (response.ok && data.sentiment !== undefined && data.keywords) {
        setSentimentResult(data);
        setSentimentHistory(prev => [...prev, {
          sentiment: data.sentiment,
          keywords: data.keywords,
          timestamp: Date.now(),
          text: transcript.substring(0, 50)
        }]);
      } else {
        console.error('Backend error:', data);
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Failed to send to backend:', err);
      setError('Failed to send to backend.');
    }
  };

  const handleClear = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    setTranscript('');
    setSentimentResult(null);
    finalTranscriptRef.current = '';
    setError('');
  };

  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording]);

  return (
    <div className="App">
      {isRecording && !sentimentResult ? (
        <RecordingWave />
      ) : sentimentResult ? (
        <P5Canvas 
          sentiment={sentimentResult.sentiment} 
          keywords={sentimentResult.keywords} 
        />
      ) : (
        <InitialWave />
      )}
      
      <div className="app-content">
        <header className="App-header">
          <h1>Sentiment Aura</h1>
          <p className="subtitle">AI-powered emotional resonance visualization</p>
        </header>
        
        <main className="App-main">
          <Controls 
            isRecording={isRecording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            hasTranscript={!!transcript && !isRecording}
            onAnalyze={sendToBackend}
            onClear={handleClear}
          />

          {error && (
            <div className="error">
              ⚠️ {error}
            </div>
          )}

          <TranscriptDisplay 
            transcript={transcript}
            isRecording={isRecording}
          />

          <div className="analysis-grid">
            <KeywordsDisplay 
              keywords={sentimentResult?.keywords}
              sentiment={sentimentResult?.sentiment}
            />
            
            <SentimentHistory history={sentimentHistory} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;


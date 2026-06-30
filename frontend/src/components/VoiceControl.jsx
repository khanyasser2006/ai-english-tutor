import { useState, useEffect } from 'react';

export default function VoiceControl({ onUserSpoke, isListening, isSpeaking, isLoading, disabled, characterName = 'Tutor' }) {
  const [pulseRings, setPulseRings] = useState([]);

  useEffect(() => {
    setPulseRings(isListening ? [0, 1, 2] : []);
  }, [isListening]);

  const getButtonLabel = () => {
    if (isListening) return 'Listening...';
    if (isSpeaking)  return `${characterName} is speaking...`;
    if (isLoading)   return `${characterName} is thinking...`;
    return 'Tap to speak';
  };

  const isDisabled = disabled || isSpeaking || isLoading;

  return (
    <div className="voice-control">
      <div className="mic-container">
        {pulseRings.map((_, i) => (
          <div
            key={i}
            className="pulse-ring"
            style={{ animationDelay: `${i * 0.28}s` }}
          />
        ))}
        <button
          className={`mic-btn ${isListening ? 'listening' : ''} ${isDisabled ? 'disabled' : ''}`}
          onClick={onUserSpoke}
          disabled={isDisabled}
          aria-label={getButtonLabel()}
        >
          <span className="mic-icon">
            {isListening ? (
              <div className="wave-bars">
                {[0.3,0.6,1,0.7,0.4].map((d,i) => (
                  <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s`, animationDuration: `${d * 0.55 + 0.35}s` }} />
                ))}
              </div>
            ) : isSpeaking ? '🔊' : isLoading ? '⏳' : '🎙️'}
          </span>
        </button>
      </div>
      <span className="voice-label">{getButtonLabel()}</span>
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!SpeechRecognition) {
        reject(new Error('Speech recognition not supported in this browser. Use Chrome or Edge.'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognitionRef.current = recognition;
      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    });
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const speak = useCallback((text, emotion = 'neutral') => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';

      // Adjust voice characteristics based on emotion
      const emotionSettings = {
        happy:      { rate: 1.05, pitch: 1.1,  volume: 1.0 },
        warm:       { rate: 0.95, pitch: 1.0,  volume: 0.95 },
        thinking:   { rate: 0.88, pitch: 0.95, volume: 0.9 },
        surprised:  { rate: 1.1,  pitch: 1.2,  volume: 1.0 },
        apologetic: { rate: 0.92, pitch: 0.9,  volume: 0.9 },
        neutral:    { rate: 1.0,  pitch: 1.0,  volume: 1.0 },
      };

      const settings = emotionSettings[emotion] || emotionSettings.neutral;
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;

      // Pick an English male voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('James'))
      ) || voices.find(v => v.lang.startsWith('en')) || null;

      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const cancelSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isListening, isSpeaking, startListening, stopListening, speak, cancelSpeech };
}

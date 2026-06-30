import { useState, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import HomePage from './components/HomePage.jsx';
import TutorLevel from './components/TutorLevel.jsx';
import WaiterScene from './components/WaiterScene.jsx';
import VoiceControl from './components/VoiceControl.jsx';
import ConversationPanel from './components/ConversationPanel.jsx';
import FeedbackPanel from './components/FeedbackPanel.jsx';
import TextInput from './components/TextInput.jsx';
import { useSpeech } from './hooks/useSpeech.js';
import { useConversation } from './hooks/useConversation.js';
import { useEffect, useRef } from 'react';

// ─── Restaurant View (Level 2) ────────────────────────────────────────────────
function RestaurantView() {
  const sceneRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { isListening, isSpeaking, startListening, stopListening, speak, cancelSpeech } = useSpeech();
  const {
    messages, corrections, vocabulary,
    waiterState, isLoading, error,
    greet, sendMessage,
    setWaiterIdle, setWaiterListening, clearVocabulary,
  } = useConversation();

  const handleStart = async () => {
    setStarted(true);
    setErrorMsg('');
    const response = await greet();
    if (response) {
      await speak(response.message, response.emotion);
      setWaiterIdle();
    }
  };

  const handleUserInput = useCallback(async (text) => {
    cancelSpeech();
    const response = await sendMessage(text);
    if (response) {
      await speak(response.message, response.emotion);
      setWaiterIdle();
    }
  }, [cancelSpeech, sendMessage, speak, setWaiterIdle]);

  const handleVoiceClick = useCallback(async () => {
    if (isListening) { stopListening(); return; }
    setErrorMsg('');
    setWaiterListening();
    try {
      const transcript = await startListening();
      if (transcript?.trim()) {
        await handleUserInput(transcript);
      } else {
        setWaiterIdle();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Microphone not available. Please use the text input below.');
      setWaiterIdle();
    }
  }, [isListening, stopListening, startListening, handleUserInput, setWaiterIdle, setWaiterListening]);

  useEffect(() => {
    if (error) setErrorMsg(error);
  }, [error]);

  return (
    <div className="app">
      <div className="scene-container">
        <WaiterScene ref={sceneRef} waiterState={waiterState} />
      </div>

      {!started && (
        <div className="start-overlay">
          <div className="start-card">
            <div className="start-icon">🍽️</div>
            <h1 className="start-title">Welcome to La Bella Vista</h1>
            <p className="start-desc">
              Practice your English with <strong>Marco</strong>, our charming Italian waiter.
              Order your meal, make conversation, and improve your speaking skills naturally.
            </p>
            <ul className="start-features">
              <li>🎙️ Speak or type your responses</li>
              <li>✏️ Get gentle grammar corrections</li>
              <li>📚 Learn new dining vocabulary</li>
              <li>🤌 Immersive restaurant roleplay</li>
            </ul>
            <button className="start-btn" onClick={handleStart}>
              Enter the Restaurant
            </button>
            <p className="start-note">
              💡 Best experience in Chrome or Edge with microphone access
            </p>
          </div>
        </div>
      )}

      {started && (
        <div className="ui-layer">
          <div className="left-panel">
            <FeedbackPanel
              corrections={corrections}
              vocabulary={vocabulary}
              onClearVocab={clearVocabulary}
            />
          </div>
          <div className="center-controls">
            {errorMsg && <div className="error-banner">⚠️ {errorMsg}</div>}
            <ConversationPanel messages={messages} isLoading={isLoading} character="waiter" />
            <div className="controls-row">
              <VoiceControl
                onUserSpoke={handleVoiceClick}
                isListening={isListening}
                isSpeaking={isSpeaking}
                isLoading={isLoading}
                disabled={!started}
                characterName="Marco"
              />
            </div>
            <TextInput onSend={handleUserInput} disabled={isLoading || isSpeaking} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root App with view routing ───────────────────────────────────────────────
export default function App() {
  // 'home' | 'tutor' | 'restaurant'
  const [view, setView] = useState('home');
  const [tutorSubLevel, setTutorSubLevel] = useState(1);

  const handleSelectLevel = (levelId) => {
    if (levelId === 1) setView('tutor');
    if (levelId === 2) setView('restaurant');
  };

  return (
    <div className="root-shell">
      <Navbar
        view={view}
        onBack={() => setView('home')}
        currentSubLevel={tutorSubLevel}
      />

      <div className="root-content">
        {view === 'home'       && <HomePage onSelectLevel={handleSelectLevel} />}
        {view === 'tutor'      && <TutorLevel onSubLevelChange={setTutorSubLevel} />}
        {view === 'restaurant' && <RestaurantView />}
      </div>
    </div>
  );
}

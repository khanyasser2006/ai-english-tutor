import { useEffect, useRef, useCallback, useState } from 'react';
import TutorScene from './TutorScene.jsx';
import ConversationPanel from './ConversationPanel.jsx';
import FeedbackPanel from './FeedbackPanel.jsx';
import TextInput from './TextInput.jsx';
import VoiceControl from './VoiceControl.jsx';
import { useSpeech } from '../hooks/useSpeech.js';
import { useTutorConversation } from '../hooks/useTutorConversation.js';

const SUB_LEVELS = [
  { id: 1, icon: '👋', label: 'Greetings',          desc: 'Hello & Introductions' },
  { id: 2, icon: '📚', label: 'Tenses',             desc: 'Past, Present, Future' },
  { id: 3, icon: '🔤', label: 'Nouns & Pronouns',  desc: 'Words & References' },
  { id: 4, icon: '✍️', label: 'Sentence Phrasing', desc: 'Structure & Flow' },
  { id: 5, icon: '🎯', label: 'Real Talk Test',     desc: 'Final Assessment' },
];

export default function TutorLevel() {
  const sceneRef   = useRef(null);
  const [started,  setStarted]  = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { isListening, isSpeaking, startListening, stopListening, speak, cancelSpeech } = useSpeech();
  const {
    messages, corrections, vocabulary,
    tutorState, isLoading, error,
    currentSubLevel, completedSubLevels,
    lessonProgress, showCompletion, allLevelsComplete,
    greet, sendMessage, advanceSubLevel, jumpToSubLevel,
    setTutorIdle, setTutorListening, clearVocabulary,
  } = useTutorConversation();

  // Start current sub-level
  const handleStart = useCallback(async () => {
    setStarted(true);
    setErrorMsg('');
    const response = await greet(currentSubLevel);
    if (response) {
      await speak(response.message, response.emotion);
      setTutorIdle();
    }
  }, [greet, currentSubLevel, speak, setTutorIdle]);

  // User input handler
  const handleUserInput = useCallback(async (text) => {
    cancelSpeech();
    const response = await sendMessage(text);
    if (response) {
      await speak(response.message, response.emotion);
      setTutorIdle();
    }
  }, [cancelSpeech, sendMessage, speak, setTutorIdle]);

  // Voice click
  const handleVoiceClick = useCallback(async () => {
    if (isListening) { stopListening(); return; }
    setErrorMsg('');
    setTutorListening();
    try {
      const transcript = await startListening();
      if (transcript?.trim()) {
        await handleUserInput(transcript);
      } else {
        setTutorIdle();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Microphone not available. Please use text input below.');
      setTutorIdle();
    }
  }, [isListening, stopListening, startListening, handleUserInput, setTutorIdle, setTutorListening]);

  // Auto advance after completion
  const handleAdvance = useCallback(async () => {
    const next = advanceSubLevel();
    if (next) {
      setStarted(false);
      setTimeout(() => {
        setStarted(true);
        greet(next).then(response => {
          if (response) {
            speak(response.message, response.emotion).then(() => setTutorIdle());
          }
        });
      }, 400);
    }
  }, [advanceSubLevel, greet, speak, setTutorIdle]);

  useEffect(() => {
    if (error) setErrorMsg(error);
  }, [error]);

  // FIX 3: all sub-levels freely accessible
  const isSublevelUnlocked = () => true;

  return (
    <div className="tutor-level">

      {/* ── LEFT SIDEBAR ────────────────────────────────────────────── */}
      <aside className="tutor-sidebar">
        <div className="tutor-sidebar-header">
          <span className="tutor-sidebar-icon">🎓</span>
          <div>
            <div className="tutor-sidebar-title">Level 1</div>
            <div className="tutor-sidebar-sub">English Tutor</div>
          </div>
        </div>

        <div className="tutor-sidebar-progress">
          <div className="tutor-progress-label">
            <span>Overall Progress</span>
            <span>{completedSubLevels.length}/5</span>
          </div>
          <div className="tutor-progress-bar-bg">
            <div
              className="tutor-progress-bar-fill"
              style={{ width: `${(completedSubLevels.length / 5) * 100}%` }}
            />
          </div>
        </div>

        <nav className="tutor-sublevel-list">
          {SUB_LEVELS.map(sl => {
            const isComplete = completedSubLevels.includes(sl.id);
            const isActive   = currentSubLevel === sl.id && started;
            const isUnlocked = isSublevelUnlocked(sl.id);

            return (
              <button
                key={sl.id}
                className={`tutor-sublevel-item ${isActive ? 'tutor-sublevel--active' : ''} ${isComplete ? 'tutor-sublevel--complete' : ''} ${!isUnlocked ? 'tutor-sublevel--locked' : ''}`}
                onClick={() => {
                  if (isUnlocked && !isActive) {
                    jumpToSubLevel(sl.id);
                    setStarted(false);
                  }
                }}
                disabled={!isUnlocked}
              >
                <span className="tutor-sl-status">
                  {isComplete ? '✅' : isActive ? '▶' : isUnlocked ? sl.icon : '🔒'}
                </span>
                <div className="tutor-sl-info">
                  <span className="tutor-sl-label">{sl.label}</span>
                  <span className="tutor-sl-desc">{sl.desc}</span>
                </div>
                {isActive && !isComplete && (
                  <div
                    className="tutor-sl-miniprogress"
                    style={{ width: `${lessonProgress}%` }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="tutor-main">

        {/* 3D Scene (full background) */}
        <div className="tutor-scene-wrap">
          <TutorScene ref={sceneRef} tutorState={tutorState} />
        </div>

        {/* Sub-level label */}
        {started && (
          <div className="tutor-sublevel-badge">
            <span>{SUB_LEVELS[currentSubLevel - 1]?.icon}</span>
            <span>Sub-Level {currentSubLevel}: {SUB_LEVELS[currentSubLevel - 1]?.label}</span>
            {lessonProgress > 0 && (
              <div className="tutor-badge-progress">
                <div style={{ width: `${lessonProgress}%` }} className="tutor-badge-fill" />
              </div>
            )}
          </div>
        )}

        {/* ── START SCREEN ─────────────────────────────────────────── */}
        {!started && !allLevelsComplete && (
          <div className="tutor-start-overlay">
            <div className="tutor-start-card">
              <div className="tutor-start-icon">
                {SUB_LEVELS[currentSubLevel - 1]?.icon}
              </div>
              <h2 className="tutor-start-title">
                Sub-Level {currentSubLevel}: {SUB_LEVELS[currentSubLevel - 1]?.label}
              </h2>
              <p className="tutor-start-desc">
                {currentSubLevel === 1 && 'Learn how to greet people in English — formally and informally. Practice with Alex and master the basics of introductions.'}
                {currentSubLevel === 2 && 'Master the three main tenses — Simple Past, Present, and Future. Describe what happened, what happens, and what will happen.'}
                {currentSubLevel === 3 && 'Understand nouns and how to replace them with pronouns. Learn to speak naturally without awkward repetition.'}
                {currentSubLevel === 4 && 'Build better sentences using Subject-Verb-Object structure and connecting words like "because", "but", and "so".'}
                {currentSubLevel === 5 && 'This is your final test. Have a real English conversation with Alex and receive a detailed score on your fluency!'}
              </p>
              <div className="tutor-start-features">
                <span>🎙️ Speak or type</span>
                <span>✏️ Grammar corrections</span>
                <span>📖 New vocabulary</span>
              </div>
              <button className="tutor-start-btn" onClick={handleStart}>
                {currentSubLevel === 5 ? '🎯 Begin My Test' : '▶ Start Sub-Level'}
              </button>
              <p className="tutor-start-note">💡 Best in Chrome or Edge with microphone</p>
            </div>
          </div>
        )}

        {/* ── ALL LEVELS COMPLETE ───────────────────────────────────── */}
        {allLevelsComplete && (
          <div className="tutor-start-overlay">
            <div className="tutor-start-card tutor-complete-card">
              <div className="tutor-complete-trophy">🏆</div>
              <h2 className="tutor-start-title">Level 1 Complete!</h2>
              <p className="tutor-start-desc">
                Amazing work! You've mastered all 5 sub-levels of English Fundamentals.
                You're ready for Level 2!
              </p>
              <div className="tutor-complete-scores">
                {SUB_LEVELS.map(sl => (
                  <div key={sl.id} className="tutor-complete-row">
                    <span>{sl.icon} {sl.label}</span>
                    <span className="tutor-complete-check">✅</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LESSON COMPLETE TRANSITION ───────────────────────────── */}
        {showCompletion && !allLevelsComplete && (
          <div className="tutor-completion-overlay">
            <div className="tutor-completion-card">
              <div className="tutor-completion-stars">⭐⭐⭐</div>
              <h3>Sub-Level {currentSubLevel} Complete!</h3>
              <p>
                {currentSubLevel === 4
                  ? 'Incredible! Get ready for your final Real Talk Test.'
                  : `Excellent work! Moving you to Sub-Level ${currentSubLevel + 1}...`}
              </p>
              <button className="tutor-advance-btn" onClick={handleAdvance}>
                {currentSubLevel === 4 ? '🎯 Take the Real Talk Test' : `Continue to Sub-Level ${currentSubLevel + 1} →`}
              </button>
            </div>
          </div>
        )}

        {/* ── UI LAYER (after start) ───────────────────────────────── */}
        {started && !showCompletion && !allLevelsComplete && (
          <div className="tutor-ui-layer">
            <div className="tutor-left-panel">
              <FeedbackPanel
                corrections={corrections}
                vocabulary={vocabulary}
                onClearVocab={clearVocabulary}
              />
            </div>

            <div className="tutor-center-controls">
              {errorMsg && (
                <div className="error-banner">⚠️ {errorMsg}</div>
              )}
              <ConversationPanel messages={messages} isLoading={isLoading} />
              <div className="controls-row">
                <VoiceControl
                  onUserSpoke={handleVoiceClick}
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isLoading={isLoading}
                  disabled={!started}
                />
              </div>
              <TextInput onSend={handleUserInput} disabled={isLoading || isSpeaking} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

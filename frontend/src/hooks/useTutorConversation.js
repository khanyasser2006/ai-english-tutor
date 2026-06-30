import { useState, useCallback, useRef } from 'react';
import { fetchTutorGreeting, sendTutorChat } from '../services/api.js';

export function useTutorConversation() {
  const [messages, setMessages]               = useState([]);
  const [corrections, setCorrections]         = useState([]);
  const [vocabulary, setVocabulary]           = useState(null);
  const [tutorState, setTutorState]           = useState('idle');
  const [isLoading, setIsLoading]             = useState(false);
  const [error, setError]                     = useState(null);
  const [currentSubLevel, setCurrentSubLevel] = useState(1);
  const [completedSubLevels, setCompletedSubLevels] = useState([]);
  const [lessonProgress, setLessonProgress]   = useState(0);
  const [showCompletion, setShowCompletion]   = useState(false);
  const [allLevelsComplete, setAllLevelsComplete] = useState(false);

  // ── FIX 1: use a ref so we can read messages synchronously inside callbacks ──
  const messagesRef = useRef([]);
  const currentSubLevelRef = useRef(1);

  const syncMessages = (msgs) => {
    messagesRef.current = msgs;
    return msgs;
  };

  const buildHistory = useCallback((msgs) =>
    msgs.map(m => ({
      role: m.sender === 'tutor' ? 'tutor' : 'user',
      content: m.text,
    }))
  , []);

  const handleResponse = useCallback((response) => {
    // ── FIX 2: filter out corrections where original/correct are empty ──
    if (response.corrections?.length) {
      const valid = response.corrections.filter(
        c => c.original && c.correct && c.original.trim() !== '' && c.correct.trim() !== ''
      );
      if (valid.length) {
        setCorrections(prev => [...valid, ...prev]);
      }
    }
    if (response.vocabulary) {
      setVocabulary(response.vocabulary);
    }
    if (typeof response.lessonProgress === 'number') {
      setLessonProgress(response.lessonProgress);
    }
    return response;
  }, []);

  const greet = useCallback(async (subLevel) => {
    setIsLoading(true);
    setTutorState('thinking');
    setError(null);
    setMessages([]);
    messagesRef.current = [];
    setCorrections([]);
    setVocabulary(null);
    setLessonProgress(0);
    setShowCompletion(false);
    currentSubLevelRef.current = subLevel;

    try {
      const response = await fetchTutorGreeting(subLevel);
      const tutorMsg = {
        id: Date.now(),
        sender: 'tutor',
        text: response.message,
        emotion: response.emotion,
      };
      setMessages(syncMessages([tutorMsg]));
      handleResponse(response);
      setTutorState('talking');
      return response;
    } catch {
      setError('Could not connect to the server. Make sure the backend is running.');
      setTutorState('idle');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleResponse]);

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || isLoading) return null;

    const userMsg = { id: Date.now(), sender: 'user', text: userText };

    // ── FIX 1: capture history BEFORE adding user message, using the ref ──
    const historyBeforeThisMessage = buildHistory(messagesRef.current);

    // Now add user message to state + ref
    const withUser = [...messagesRef.current, userMsg];
    messagesRef.current = withUser;
    setMessages(withUser);

    setIsLoading(true);
    setTutorState('thinking');
    setError(null);

    try {
      const response = await sendTutorChat(
        userText,
        currentSubLevelRef.current,
        historyBeforeThisMessage
      );

      const tutorMsg = {
        id: Date.now() + 1,
        sender: 'tutor',
        text: response.message,
        emotion: response.emotion,
      };

      const withTutor = [...messagesRef.current, tutorMsg];
      messagesRef.current = withTutor;
      setMessages(withTutor);

      handleResponse(response);
      setTutorState('talking');

      if (response.lessonComplete) {
        setCompletedSubLevels(prev =>
          prev.includes(currentSubLevelRef.current)
            ? prev
            : [...prev, currentSubLevelRef.current]
        );
        setLessonProgress(100);
        setShowCompletion(true);
        if (currentSubLevelRef.current >= 5) setAllLevelsComplete(true);
      }

      return response;
    } catch {
      setError('Failed to get a response. Please try again.');
      setTutorState('idle');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, buildHistory, handleResponse]);

  const advanceSubLevel = useCallback(() => {
    if (currentSubLevelRef.current < 5) {
      const next = currentSubLevelRef.current + 1;
      setCurrentSubLevel(next);
      currentSubLevelRef.current = next;
      setShowCompletion(false);
      return next;
    }
    return null;
  }, []);

  const jumpToSubLevel = useCallback((level) => {
    setCurrentSubLevel(level);
    currentSubLevelRef.current = level;
    setShowCompletion(false);
    setMessages([]);
    messagesRef.current = [];
    setCorrections([]);
    setVocabulary(null);
    setLessonProgress(0);
  }, []);

  const setTutorIdle      = useCallback(() => setTutorState('idle'), []);
  const setTutorListening = useCallback(() => setTutorState('listening'), []);
  const clearVocabulary   = useCallback(() => setVocabulary(null), []);

  return {
    messages, corrections, vocabulary,
    tutorState, isLoading, error,
    currentSubLevel, completedSubLevels,
    lessonProgress, showCompletion, allLevelsComplete,
    greet, sendMessage, advanceSubLevel, jumpToSubLevel,
    setTutorIdle, setTutorListening, clearVocabulary,
  };
}

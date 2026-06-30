import { useState, useCallback } from 'react';
import { fetchGreeting, sendChat } from '../services/api.js';

export function useConversation() {
  const [messages, setMessages] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [vocabulary, setVocabulary] = useState(null);
  const [waiterState, setWaiterState] = useState('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Build Gemini-compatible history from messages
  const buildHistory = useCallback((msgs) => {
    return msgs.map(m => ({
      role: m.sender === 'waiter' ? 'model' : 'user',
      content: m.text,
    }));
  }, []);

  const greet = useCallback(async () => {
    setIsLoading(true);
    setWaiterState('thinking');
    setError(null);
    try {
      const response = await fetchGreeting();
      const waiterMsg = {
        id: Date.now(),
        sender: 'waiter',
        text: response.message,
        emotion: response.emotion,
      };
      setMessages([waiterMsg]);
      if (response.corrections?.length) setCorrections(prev => [...prev, ...response.corrections]);
      if (response.vocabulary) setVocabulary(response.vocabulary);
      setWaiterState('talking');
      return response;
    } catch (err) {
      setError('Could not connect to the server. Make sure the backend is running.');
      setWaiterState('idle');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || isLoading) return null;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
    };

    setMessages(prev => {
      const updated = [...prev, userMsg];
      return updated;
    });

    setIsLoading(true);
    setWaiterState('thinking');
    setError(null);

    try {
      const currentMessages = await new Promise(resolve => {
        setMessages(prev => { resolve(prev); return prev; });
      });

      const history = buildHistory(currentMessages.slice(0, -1)); // exclude the user msg we just added
      const response = await sendChat(userText, history);

      const waiterMsg = {
        id: Date.now() + 1,
        sender: 'waiter',
        text: response.message,
        emotion: response.emotion,
      };

      setMessages(prev => [...prev, waiterMsg]);

      if (response.corrections?.length) {
        setCorrections(prev => [...response.corrections, ...prev]);
      }
      if (response.vocabulary) {
        setVocabulary(response.vocabulary);
      }

      setWaiterState('talking');
      return response;
    } catch (err) {
      setError('Failed to get a response. Please try again.');
      setWaiterState('idle');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, buildHistory]);

  const setWaiterIdle = useCallback(() => setWaiterState('idle'), []);
  const setWaiterListening = useCallback(() => setWaiterState('listening'), []);
  const clearCorrections = useCallback(() => setCorrections([]), []);
  const clearVocabulary = useCallback(() => setVocabulary(null), []);

  return {
    messages,
    corrections,
    vocabulary,
    waiterState,
    isLoading,
    error,
    greet,
    sendMessage,
    setWaiterIdle,
    setWaiterListening,
    clearVocabulary,
    clearCorrections,
  };
}

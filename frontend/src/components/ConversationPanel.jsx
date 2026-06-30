import { useEffect, useRef } from 'react';

export default function ConversationPanel({ messages, isLoading, character = 'tutor' }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) return null;

  const isWaiter = character === 'waiter';
  const avatarLabel = isWaiter ? 'M' : 'A';
  const charName    = isWaiter ? 'Marco' : 'Alex';
  const bubbleClass = isWaiter ? 'waiter-bubble' : 'tutor-bubble';

  return (
    <div className="conversation-panel">
      <div className="conversation-scroll">
        {messages.map(msg => {
          const isChar = msg.sender === 'waiter' || msg.sender === 'tutor';
          return (
            <div
              key={msg.id}
              className={`message-bubble ${isChar ? bubbleClass : 'user-bubble'}`}
            >
              {isChar && (
                <div className={`bubble-avatar ${isWaiter ? '' : 'bubble-avatar--tutor'}`}>
                  {avatarLabel}
                </div>
              )}
              <div className="bubble-content">
                {isChar && (
                  <span className={`bubble-name ${isWaiter ? '' : 'bubble-name--tutor'}`}>
                    {charName}
                  </span>
                )}
                <p className="bubble-text">{msg.text}</p>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className={`message-bubble ${bubbleClass}`}>
            <div className={`bubble-avatar ${isWaiter ? '' : 'bubble-avatar--tutor'}`}>
              {avatarLabel}
            </div>
            <div className="bubble-content">
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

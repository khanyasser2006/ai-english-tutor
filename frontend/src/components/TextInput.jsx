import { useState } from 'react';

export default function TextInput({ onSend, disabled }) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="text-input-row">
      <input
        className="text-input"
        type="text"
        placeholder="Or type your response here..."
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        maxLength={300}
      />
      <button
        className="send-btn"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
      >
        Send →
      </button>
    </div>
  );
}

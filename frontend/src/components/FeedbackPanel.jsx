import { useState } from 'react';

export default function FeedbackPanel({ corrections, vocabulary, onClearVocab }) {
  const [tab, setTab] = useState('corrections');

  const hasCorrections = corrections && corrections.length > 0;
  const hasVocab = !!vocabulary;

  if (!hasCorrections && !hasVocab) return null;

  return (
    <div className="feedback-panel">
      <div className="feedback-tabs">
        <button
          className={`tab-btn ${tab === 'corrections' ? 'active' : ''}`}
          onClick={() => setTab('corrections')}
        >
          ✏️ Corrections
          {hasCorrections && <span className="tab-badge">{corrections.length}</span>}
        </button>
        <button
          className={`tab-btn ${tab === 'vocab' ? 'active' : ''} ${hasVocab ? 'has-new' : ''}`}
          onClick={() => setTab('vocab')}
        >
          📚 Vocabulary
          {hasVocab && <span className="tab-badge new">NEW</span>}
        </button>
      </div>

      <div className="feedback-content">
        {tab === 'corrections' && (
          <div className="corrections-list">
            {!hasCorrections ? (
              <p className="feedback-empty">No corrections yet — keep talking! 🌟</p>
            ) : (
              corrections.map((c, i) => (
                <div className="correction-card" key={i}>
                  <div className="correction-row">
                    <span className="correction-label wrong">You said:</span>
                    <span className="correction-text wrong-text">"{c.original}"</span>
                  </div>
                  <div className="correction-row">
                    <span className="correction-label right">Better:</span>
                    <span className="correction-text right-text">"{c.correct}"</span>
                  </div>
                  <p className="correction-explain">{c.explanation}</p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'vocab' && (
          <div className="vocab-content">
            {!hasVocab ? (
              <p className="feedback-empty">New words will appear here 📖</p>
            ) : (
              <div className="vocab-card">
                <div className="vocab-word">{vocabulary.word}</div>
                <div className="vocab-meaning">
                  <span className="vocab-label">Meaning:</span> {vocabulary.meaning}
                </div>
                <div className="vocab-example">
                  <span className="vocab-label">Example:</span>{' '}
                  <em>"{vocabulary.example}"</em>
                </div>
                <button className="vocab-dismiss" onClick={onClearVocab}>Got it! ✓</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

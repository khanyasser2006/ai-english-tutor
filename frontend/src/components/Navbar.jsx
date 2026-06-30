export default function Navbar({ view, onBack, currentLevel, currentSubLevel }) {
  return (
    <nav className="hub-navbar">
      <div className="hub-nav-left">
        {view !== 'home' ? (
          <button className="hub-back-btn" onClick={onBack}>
            <span className="hub-back-arrow">←</span>
            <span>Back to Levels</span>
          </button>
        ) : (
          <div className="hub-brand">
            <span className="hub-brand-icon">🎓</span>
            <div className="hub-brand-text">
              <span className="hub-brand-name">English Hub</span>
              <span className="hub-brand-sub">Interactive Learning</span>
            </div>
          </div>
        )}
      </div>

      <div className="hub-nav-center">
        {view === 'tutor' && (
          <div className="hub-breadcrumb">
            <span className="hub-crumb-dim">Level 1</span>
            <span className="hub-crumb-sep">›</span>
            <span className="hub-crumb-active">English Tutor</span>
            <span className="hub-crumb-sep">›</span>
            <span className="hub-crumb-sublevel">Sub-Level {currentSubLevel}</span>
          </div>
        )}
        {view === 'restaurant' && (
          <div className="hub-breadcrumb">
            <span className="hub-crumb-dim">Level 2</span>
            <span className="hub-crumb-sep">›</span>
            <span className="hub-crumb-active">My Restaurant</span>
          </div>
        )}
        {view === 'home' && (
          <div className="hub-nav-title">Choose Your Level</div>
        )}
      </div>

      <div className="hub-nav-right">
        <div className="hub-level-dots">
          {[1, 2].map(l => (
            <span
              key={l}
              className={`hub-dot ${
                (view === 'tutor' && l === 1) || (view === 'restaurant' && l === 2)
                  ? 'hub-dot--active'
                  : ''
              }`}
              title={l === 1 ? 'Level 1: English Tutor' : 'Level 2: Restaurant'}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

import { useState, useEffect } from 'react';

const LEVELS = [
  {
    id: 1,
    num: '01',
    icon: '🎓',
    title: 'English Fundamentals',
    subtitle: 'With AI Tutor Alex',
    desc: 'Master greetings, tenses, nouns, sentence structure — then prove it in a real conversation test.',
    subLevels: 5,
    tag: 'Beginner',
    unlocked: true,
    color: 'blue',
    cta: 'Start Learning →',
  },
  {
    id: 2,
    num: '02',
    icon: '🍝',
    title: 'My Restaurant',
    subtitle: 'With Waiter Marco',
    desc: 'Step into La Bella Vista and practise ordering food, making small talk, and dining in English.',
    subLevels: 1,
    tag: 'Intermediate',
    unlocked: true,
    color: 'gold',
    cta: 'Enter Restaurant →',
  },
  {
    id: 3,
    num: '03',
    icon: '✈️',
    title: 'Travel & Tourism',
    subtitle: 'Coming Soon',
    desc: 'Navigate airports, hotels, and sightseeing in fluent English.',
    subLevels: 5,
    tag: 'Intermediate',
    unlocked: false,
    color: 'purple',
    cta: 'Coming Soon',
  },
  {
    id: 4,
    num: '04',
    icon: '💼',
    title: 'Business English',
    subtitle: 'Coming Soon',
    desc: 'Emails, meetings, presentations — speak like a professional.',
    subLevels: 6,
    tag: 'Advanced',
    unlocked: false,
    color: 'teal',
    cta: 'Coming Soon',
  },
  {
    id: 5,
    num: '05',
    icon: '🎭',
    title: 'Cultural Stories',
    subtitle: 'Coming Soon',
    desc: 'Explore English through literature, film, and pop culture.',
    subLevels: 4,
    tag: 'Advanced',
    unlocked: false,
    color: 'orange',
    cta: 'Coming Soon',
  },
  {
    id: 6,
    num: '06',
    icon: '🏆',
    title: 'Grand Master Test',
    subtitle: 'Coming Soon',
    desc: 'The ultimate assessment — face all skills in one final challenge.',
    subLevels: 1,
    tag: 'Expert',
    unlocked: false,
    color: 'red',
    cta: 'Coming Soon',
  },
];

export default function HomePage({ onSelectLevel }) {
  const [mounted, setMounted] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`hub-home ${mounted ? 'hub-home--visible' : ''}`}>
      {/* Animated background */}
      <div className="hub-bg">
        <div className="hub-bg-orb hub-bg-orb--1" />
        <div className="hub-bg-orb hub-bg-orb--2" />
        <div className="hub-bg-orb hub-bg-orb--3" />
        <div className="hub-bg-grid" />
      </div>

      {/* Hero */}
      <div className="hub-hero">
        <div className="hub-hero-tag">🌟 AI-Powered English Learning</div>
        <h1 className="hub-hero-title">
          Master English,<br />
          <span className="hub-hero-gradient">One Level at a Time</span>
        </h1>
        <p className="hub-hero-sub">
          Choose your path below. Each level puts you face-to-face with an AI character — speak, type, and learn naturally.
        </p>
      </div>

      {/* Level Cards Grid */}
      <div className="hub-cards-grid">
        {LEVELS.map((level, idx) => (
          <div
            key={level.id}
            className={`hub-card hub-card--${level.color} ${!level.unlocked ? 'hub-card--locked' : ''} ${hoveredId === level.id ? 'hub-card--hovered' : ''}`}
            style={{ animationDelay: `${idx * 0.08}s` }}
            onMouseEnter={() => level.unlocked && setHoveredId(level.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => level.unlocked && onSelectLevel(level.id)}
          >
            {/* Card number */}
            <span className="hub-card-num">{level.num}</span>

            {/* Lock overlay */}
            {!level.unlocked && (
              <div className="hub-card-lock">
                <span className="hub-lock-icon">🔒</span>
                <span className="hub-lock-text">Coming Soon</span>
              </div>
            )}

            {/* Card content */}
            <div className="hub-card-body">
              <div className="hub-card-icon">{level.icon}</div>
              <div className="hub-card-meta">
                <span className="hub-card-tag">{level.tag}</span>
                {level.unlocked && (
                  <span className="hub-card-dots">
                    {Array.from({ length: level.subLevels }).map((_, i) => (
                      <span key={i} className="hub-card-dot" />
                    ))}
                    <span className="hub-card-dot-label">{level.subLevels} {level.subLevels === 1 ? 'Scenario' : 'Sub-Levels'}</span>
                  </span>
                )}
              </div>
              <h3 className="hub-card-title">{level.title}</h3>
              <p className="hub-card-subtitle">{level.subtitle}</p>
              <p className="hub-card-desc">{level.desc}</p>
            </div>

            {/* CTA — slides up on hover */}
            {level.unlocked && (
              <div className="hub-card-cta">
                <button className={`hub-cta-btn hub-cta-btn--${level.color}`}>
                  {level.cta}
                </button>
              </div>
            )}

            {/* Glow border */}
            <div className="hub-card-glow" />
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="hub-footer-note">
        💡 Levels 1 and 2 are available now. More coming soon!
      </p>
    </div>
  );
}

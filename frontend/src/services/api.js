const BASE_URL = 'http://localhost:5000/api';

// ─── Restaurant (existing) ───────────────────────────────────────────────────
export async function fetchGreeting() {
  const res = await fetch(`${BASE_URL}/tutor/greet`);
  if (!res.ok) throw new Error('Failed to fetch greeting');
  return res.json();
}

export async function sendChat(message, history = []) {
  const res = await fetch(`${BASE_URL}/tutor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

// ─── English Tutor (new) ─────────────────────────────────────────────────────
export async function fetchTutorGreeting(subLevel = 1) {
  const res = await fetch(`${BASE_URL}/english-tutor/greet?subLevel=${subLevel}`);
  if (!res.ok) throw new Error('Failed to fetch tutor greeting');
  return res.json();
}

export async function sendTutorChat(message, subLevel, history = []) {
  const res = await fetch(`${BASE_URL}/english-tutor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, subLevel, history }),
  });
  if (!res.ok) throw new Error('Failed to send tutor message');
  return res.json();
}

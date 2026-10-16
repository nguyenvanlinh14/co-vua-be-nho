import { speechKey } from './phrases.js';

// Âm thanh, giọng đọc, pháo giấy, lưu tiến độ.

let ctx = null;
function tone(freq, dur = 0.12, type = 'sine', when = 0, vol = 0.18) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + dur);
  } catch { /* không có âm thanh cũng không sao */ }
}

export const sound = {
  move: () => tone(520, 0.08, 'triangle'),
  collect: () => { tone(880, 0.1); tone(1320, 0.12, 'sine', 0.08); },
  good: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', i * 0.1)),
  bad: () => { tone(220, 0.18, 'square', 0, 0.06); tone(180, 0.22, 'square', 0.12, 0.06); },
  win: () => [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', i * 0.12)),
};

export const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('cvbn:' + key); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('cvbn:' + key, JSON.stringify(value)); } catch { /* chế độ riêng tư */ }
  },
};

let voiceOn = store.get('voice', true);

// Giọng Cú Mèo tạo sẵn bằng Gemini TTS (tools/tts.mjs). Thiếu file thì dùng giọng máy.
let voiceFiles = {};
fetch('audio/manifest.json').then((r) => (r.ok ? r.json() : {})).then((m) => { voiceFiles = m.files || {}; }).catch(() => {});
let playing = null;
function stopAll() {
  if (playing) { playing.pause(); playing = null; }
  try { speechSynthesis.cancel(); } catch { /* bỏ qua */ }
}

export function voiceEnabled() { return voiceOn; }
export function toggleVoice() {
  voiceOn = !voiceOn;
  store.set('voice', voiceOn);
  if (!voiceOn) stopAll();
  return voiceOn;
}
export function stopSpeaking() { stopAll(); }
export function speak(text) {
  if (!voiceOn) return;
  stopAll();
  const key = speechKey(text);
  const file = voiceFiles[key];
  if (file) {
    const a = new Audio('audio/' + file);
    playing = a;
    a.play().catch(() => { if (playing === a) robotSpeak(key); });
    return;
  }
  robotSpeak(key);
}
function robotSpeak(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN';
    u.rate = 0.95;
    const vi = speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith('vi'));
    if (vi) u.voice = vi;
    speechSynthesis.speak(u);
  } catch { /* bỏ qua */ }
}

export function confetti(n = 60) {
  const box = document.getElementById('confetti');
  const colors = ['#ff8a3d', '#ffd166', '#3fb56b', '#5ec8c8', '#c39bff', '#ff6b6b'];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'cf';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[i % colors.length];
    el.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
    el.style.animationDelay = Math.random() * 0.4 + 's';
    box.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

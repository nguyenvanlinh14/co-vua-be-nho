import { Chess } from '../vendor/chess.js';
import { WORLDS, BOTS } from './lessons.js';
import { targets, sq as mkSq, FILES } from './stars.js';
import { bestMove, mateIn } from './engine.js';
import { sound, speak, store, confetti, toggleVoice, voiceEnabled } from './fx.js';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const BREAK_MS = 12 * 60 * 1000; // nhắc nghỉ sau ~12 phút
const PRAISE = ['Giỏi quá!', 'Tuyệt vời!', 'Con làm được rồi!', 'Siêu quá!', 'Đúng rồi!', 'Xuất sắc!'];
const OOPS = ['Chưa đúng rồi, thử lại nhé!', 'Gần đúng rồi! Thử lần nữa nào.', 'Không sao, nghĩ thêm chút nhé!'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clean = (s) => s.replace(/[+#]/g, '');
const $ = (id) => document.getElementById(id);
const app = $('app');

const unlockAll = new URLSearchParams(location.search).has('all');
let progress = store.get('progress', {});      // lessonId -> số sao (1..3)
let sessionStart = Date.now();
let token = 0;                                  // huỷ các setTimeout của màn cũ

// ---------------- Tiện ích DOM ----------------
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null) el.append(kid);
  return el;
}
function later(fn, ms) { const t = token; setTimeout(() => { if (t === token) fn(); }, ms); }

function totalStars() { return Object.values(progress).reduce((a, b) => a + b, 0); }
function updateTop(title) {
  $('top-title').textContent = title || 'Cờ Vua Bé Nhỏ';
  $('star-total').textContent = '⭐ ' + totalStars();
}

// ---------------- Bàn cờ ----------------
// opts: pieces {sq: 'K'|'p'|'star'|'rock'}, marks, dots, caps, sel, last, check, hints, onTap
function renderBoard(opts) {
  const board = h('div', { class: 'board' + (opts.onTap ? ' find' : '') });
  for (let r = 7; r >= 0; r--) {
    for (let f = 0; f < 8; f++) {
      const s = mkSq(f, r);
      const cls = ['sq', (f + r) % 2 ? 'l' : 'd'];
      if (opts.sel === s) cls.push('sel');
      if (opts.marks?.includes(s)) cls.push('mark');
      if (opts.hints?.includes(s)) cls.push('hint');
      if (opts.last?.includes(s)) cls.push('last');
      if (opts.check === s) cls.push('check');
      const cell = h('div', { class: cls.join(' '), 'data-sq': s });
      if (f === 0) cell.append(h('span', { class: 'coord r' }, String(r + 1)));
      if (r === 0) cell.append(h('span', { class: 'coord f' }, FILES[f]));
      const p = opts.pieces?.[s];
      if (p === 'star') cell.append(h('span', { class: 'pc emoji' }, '⭐'));
      else if (p === 'rock') cell.append(h('span', { class: 'pc emoji' }, '🪨'));
      else if (p) {
        const white = p === p.toUpperCase();
        cell.append(h('span', { class: `pc ${white ? 'w' : 'b'}${opts.pop === s ? ' pop' : ''}` }, GLYPH[p.toLowerCase()] + '︎'));
      }
      if (opts.dots?.includes(s)) cell.append(h('span', { class: p && p !== 'star' ? 'dot cap' : 'dot' }));
      if (opts.onTap) cell.addEventListener('click', () => opts.onTap(s));
      board.append(cell);
    }
  }
  return h('div', { class: 'board-wrap' }, board);
}

function piecesFromGame(game) {
  const out = {};
  for (const row of game.board()) for (const p of row) if (p) out[p.square] = p.color === 'w' ? p.type.toUpperCase() : p.type;
  return out;
}
function piecesFromFen(fen) { return piecesFromGame(new Chess(fen)); }
function kingSquare(game, color) {
  for (const row of game.board()) for (const p of row) if (p && p.type === 'k' && p.color === color) return p.square;
  return null;
}
function shake() {
  const b = app.querySelector('.board, .choices');
  if (!b) return;
  b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
}

// ---------------- Bản đồ ----------------
function worldUnlocked(i) {
  if (unlockAll || i === 0) return true;
  const prev = WORLDS[i - 1].lessons;
  return prev.filter((l) => progress[l.id]).length >= Math.ceil(prev.length / 2);
}
function nextLesson() {
  for (let i = 0; i < WORLDS.length; i++) {
    if (!worldUnlocked(i)) break;
    for (const l of WORLDS[i].lessons) if (!progress[l.id]) return l.id;
  }
  return null;
}

function showMap() {
  token++;
  updateTop();
  const next = nextLesson();
  const done = Object.keys(progress).length;
  const greet = done === 0
    ? 'Chào con! Bấm vào bài sáng đèn để bắt đầu nhé!'
    : next ? `Con đã có ${totalStars()} ngôi sao! Học tiếp bài sáng đèn nhé!` : 'Con đã học xong hết! Con là nhà vô địch cờ vua! 🏆';
  app.replaceChildren(
    h('div', { class: 'hero' }, h('div', { class: 'owl' }, '🦉'), h('div', { class: 'bubble' }, greet)),
    ...WORLDS.map((w, wi) => {
      const open = worldUnlocked(wi);
      return h('section', { class: 'world' + (open ? '' : ' locked') },
        h('h2', { class: 'world-head' },
          h('span', { class: 'badge', style: `background:${w.color}` }, open ? w.emoji : '🔒'),
          `${wi + 1}. ${w.title}`),
        h('div', { class: 'lessons' }, w.lessons.map((l) => {
          const s = progress[l.id] || 0;
          return h('button', {
            class: 'lesson-btn' + (l.id === next ? ' next' : ''),
            disabled: !open,
            onclick: () => startLesson(w, l),
          },
          h('span', { class: 'le' }, l.emoji),
          h('span', { class: 'lt' }, l.title),
          h('span', { class: 'ls' }, '★'.repeat(s) + '☆'.repeat(3 - s)));
        })));
    }),
    h('p', { class: 'footer-note' },
      'Dành cho bố mẹ: mỗi ngày 10–15 phút là đủ. Học xong hết, bé có thể luyện tiếp ở ',
      h('a', { href: 'https://lichess.org/learn', target: '_blank', rel: 'noopener' }, 'lichess.org/learn'),
      ' (miễn phí).'),
  );
  if (next) app.querySelector('.lesson-btn.next')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

// ---------------- Bài học ----------------
let L = null; // { world, lesson, i, mistakes, hints }

function startLesson(world, lesson) {
  L = { world, lesson, i: 0, mistakes: 0, hints: 0 };
  runStep();
}

function lessonFrame(step) {
  token++;
  updateTop(`${L.lesson.emoji} ${L.lesson.title}`);
  const prog = h('div', { class: 'progress' }, L.lesson.steps.map((_, k) => h('span', { class: k < L.i ? 'done' : k === L.i ? 'cur' : '' })));
  const bubble = h('div', { class: 'bubble' });
  const area = h('div');
  const actions = h('div', { class: 'actions' });
  app.replaceChildren(prog, h('div', { class: 'say' }, h('div', { class: 'owl' }, '🦉'), bubble), area, actions);
  const ui = {
    area, actions,
    say(text, mood = '', voice = true) {
      bubble.textContent = text;
      bubble.className = 'bubble' + (mood ? ' ' + mood : '');
      if (voice) speak(text);
    },
    setActions(...btns) { actions.replaceChildren(...btns.filter(Boolean)); },
    success(msg) {
      sound.good();
      ui.say(msg || pick(PRAISE), 'good');
      ui.setActions(h('button', { class: 'big-btn green', onclick: nextStep }, 'Tiếp tục ➜'));
    },
    oops(msg) {
      L.mistakes++;
      sound.bad();
      shake();
      ui.say(msg || pick(OOPS), 'bad');
    },
  };
  return ui;
}

function nextStep() {
  L.i++;
  if (L.i >= L.lesson.steps.length) finishLesson();
  else runStep();
}

function runStep() {
  const step = L.lesson.steps[L.i];
  const ui = lessonFrame(step);
  ({ slide: runSlide, find: runFind, choose: runChoose, stars: runStars, puzzle: runPuzzle, play: runPlay })[step.type](step, ui);
}

function runSlide(step, ui) {
  ui.say(step.say);
  if (step.emoji) ui.area.append(h('div', { class: 'big-emoji' }, step.emoji));
  if (step.board) {
    const b = step.board;
    const pieces = b.fen ? piecesFromFen(b.fen) : { ...(b.pieces || {}) };
    let dots = [];
    if (b.showMoves) dots = targets(pieces[b.showMoves].toLowerCase(), b.showMoves);
    ui.area.append(renderBoard({ pieces, dots, marks: b.marks }));
  }
  ui.setActions(
    h('button', { class: 'big-btn', onclick: () => speak(step.say) }, '🔊 Nghe lại'),
    h('button', { class: 'big-btn primary', onclick: nextStep }, 'Tiếp ➜'),
  );
}

function runFind(step, ui) {
  let wrong = 0;
  const say = `Con hãy chạm vào ô ${step.square.toUpperCase()}!`;
  ui.say(say);
  const draw = (extra = {}) => ui.area.replaceChildren(renderBoard({ pieces: {}, onTap, ...extra }));
  function onTap(s) {
    if (s === step.square) {
      draw({ marks: [s] });
      ui.success(`Đúng rồi! Đó là ô ${s.toUpperCase()}.`);
      return;
    }
    wrong++;
    ui.oops(`Đó là ô ${s.toUpperCase()}. Tìm chữ ${step.square[0].toUpperCase()} ở dưới và số ${step.square[1]} ở bên nhé!`);
    // Gợi ý: sáng cả cột và hàng.
    const hints = [];
    for (let k = 0; k < 8; k++) { hints.push(step.square[0] + (k + 1)); hints.push(FILES[k] + step.square[1]); }
    draw(wrong >= 2 ? { hints: [step.square] } : { hints });
  }
  draw();
}

function runChoose(step, ui) {
  ui.say(step.say);
  const box = h('div', { class: 'choices' }, step.options.map((o, k) => h('button', {
    class: 'big-btn',
    onclick: (e) => {
      if (k === step.answer) {
        e.currentTarget.classList.add('green');
        box.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        ui.success();
      } else ui.oops();
    },
  }, o)));
  ui.area.append(box);
}

// ---- Ăn sao ----
function runStars(step, ui) {
  const rocks = new Set(step.rocks || []);
  let at = step.from, piece = step.piece, pop = null;
  const left = new Set(step.stars);
  const enemies = { ...(step.enemies || {}) };
  const names = { r: 'Xe', b: 'Tượng', q: 'Hậu', k: 'Vua', n: 'Mã', p: 'Tốt' };
  const count = () => left.size + Object.keys(enemies).length;
  const intro = step.stars.length
    ? `${names[piece]} ơi, đi ăn hết ${count() > 1 ? count() + ' ' : ''}${Object.keys(enemies).length ? 'món' : 'ngôi sao'} nào! Chạm vào chấm xanh để đi.`
    : `${names[piece]} ơi, ăn quân đen đi! Chạm vào ô có vòng xanh.`;
  ui.say(intro);
  const moves = () => targets(piece, at, (s) => rocks.has(s), (s) => s in enemies);
  function draw() {
    const pieces = {};
    for (const s of left) pieces[s] = 'star';
    for (const s of rocks) pieces[s] = 'rock';
    Object.assign(pieces, enemies);
    pieces[at] = piece.toUpperCase();
    const done = count() === 0;
    ui.area.replaceChildren(renderBoard({ pieces, sel: done ? null : at, dots: done ? [] : moves(), pop, onTap: done ? null : onTap }));
  }
  function onTap(s) {
    if (s === at) return;
    if (!moves().includes(s)) { sound.bad(); ui.say(`${names[piece]} không đi tới ô đó được. Nhìn các chấm xanh nhé!`, 'bad'); return; }
    at = s; pop = s;
    const got = left.delete(s) || (s in enemies && delete enemies[s]);
    if (got) sound.collect(); else sound.move();
    if (piece === 'p' && s[1] === '8') { piece = 'q'; sound.win(); ui.say('Phép thuật! Tốt biến thành Hậu rồi!', 'good'); }
    else if (count()) ui.say(`Còn ${count()} nữa thôi!`, '', false);
    draw();
    if (!count()) ui.success();
  }
  draw();
}

// ---- Thế cờ ----
function setupGame(step) {
  const g = new Chess(step.fen || START);
  for (const m of step.start || []) g.move(m);
  return g;
}

function boardFor(game, state, onTap) {
  const pieces = piecesFromGame(game);
  const dots = state.sel ? game.moves({ square: state.sel, verbose: true }).map((m) => m.to) : [];
  const check = game.inCheck() ? kingSquare(game, game.turn()) : null;
  return renderBoard({ pieces, sel: state.sel, dots, last: state.last, check, hints: state.hints, pop: state.last?.[1], onTap });
}

// Bé chạm ô: chọn quân / đi quân. Gọi onMove(moveObj) khi đi hợp lệ.
function tapper(game, state, ui, onMove, redraw) {
  return (s) => {
    if (state.busy || state.over) return;
    if (state.sel) {
      const mv = game.moves({ square: state.sel, verbose: true }).find((m) => m.to === s);
      if (mv) {
        const m = game.move({ from: mv.from, to: mv.to, promotion: 'q' });
        state.sel = null; state.hints = null; state.last = [m.from, m.to];
        sound.move();
        redraw();
        onMove(m);
        return;
      }
    }
    const p = game.get(s);
    if (p && p.color === game.turn()) {
      state.sel = state.sel === s ? null : s;
      if (state.sel && !game.moves({ square: s }).length) {
        sound.bad();
        ui.say(game.inCheck() ? 'Vua đang bị chiếu! Phải cứu Vua trước.' : 'Quân này đang bị kẹt, chọn quân khác nhé.', 'bad');
      }
    } else state.sel = null;
    redraw();
  };
}

function runPuzzle(step, ui) {
  let game = setupGame(step);
  const state = { sel: null, last: null, hints: null, busy: false, over: false };
  let solIdx = 0, used = 0;
  const maxMoves = step.maxMoves || 1;
  const tap = (s) => tapper(game, state, ui, onMove, redraw)(s);
  const redraw = () => ui.area.replaceChildren(boardFor(game, state, tap));
  ui.say(step.say);

  function reset(msg) {
    state.busy = true;
    later(() => {
      game = setupGame(step); solIdx = 0; used = 0;
      Object.assign(state, { sel: null, last: null, hints: null, busy: false });
      redraw();
      if (msg) ui.say(msg, '', false);
    }, 900);
  }
  function win(msg) { state.over = true; redraw(); ui.success(msg); }
  function wrongUndo(msg) {
    ui.oops(msg);
    state.busy = true;
    later(() => { game.undo(); state.last = null; state.busy = false; redraw(); }, 800);
  }

  function onMove(m) {
    const g = step.goal;
    if (g === 'solution') {
      if (clean(m.san) === clean(step.solution[solIdx]) || game.isCheckmate()) {
        solIdx++;
        if (solIdx >= step.solution.length || game.isCheckmate()) return win();
        state.busy = true;
        ui.say('Đúng rồi! Xem bên Đen đi nào...', 'good', false);
        later(() => {
          const r = game.move(step.solution[solIdx++]);
          state.last = [r.from, r.to]; state.busy = false; sound.move();
          redraw();
          if (solIdx >= step.solution.length) win();
          else ui.say('Giờ đến lượt con! Đi tiếp nào.', '', true);
        }, 900);
      } else wrongUndo();
    } else if (g === 'accept') {
      step.accept.map(clean).includes(clean(m.san)) ? win() : wrongUndo('Nước này chưa hay lắm. Nhớ bí kíp nhé!');
    } else if (g === 'check') {
      game.inCheck() ? win('Chiếu! Giỏi quá!') : wrongUndo('Vua đen chưa bị chiếu. Thử lại nào!');
    } else if (g === 'escape') {
      win('Vua an toàn rồi! Giỏi quá!');
    } else if (g === 'castle') {
      const ok = /[kq]/.test(m.flags) && (!step.side || m.flags.includes(step.side));
      ok ? win('Vua đã vào lâu đài an toàn!') : wrongUndo('Chưa phải nhập thành. Bấm Vua, rồi bấm ô cách Vua 2 ô nhé!');
    } else if (g === 'promote') {
      m.promotion ? win('Tốt đã thành Hậu! Phép thuật!') : wrongUndo();
    } else if (g === 'mate') {
      if (game.isCheckmate()) return win('CHIẾU HẾT! Con thắng rồi!');
      used++;
      if (used >= maxMoves) {
        if (maxMoves === 1) return wrongUndo(game.inCheck() ? 'Chiếu rồi, nhưng Vua đen vẫn chạy được!' : 'Chưa chiếu hết. Thử lại nào!');
        ui.oops('Vua đen thoát mất rồi! Làm lại nhé.');
        return reset('Thử cách khác nào!');
      }
      if (game.isGameOver()) { ui.oops('Ôi, hoà mất rồi! Nhớ chừa đường cho Vua đen nhé.'); return reset(); }
      state.busy = true;
      ui.say('Bên Đen đang nghĩ...', '', false);
      later(() => {
        const r = game.move(bestMove(game, 3));
        state.last = [r.from, r.to]; state.busy = false; sound.move();
        redraw();
        ui.say(`Còn ${maxMoves - used} nước để chiếu hết!`, '', true);
      }, 400);
    }
  }
  redraw();

  function hint() {
    L.hints++;
    let mv = null;
    const legal = game.moves({ verbose: true });
    if (step.goal === 'solution') mv = legal.find((m) => clean(m.san) === clean(step.solution[solIdx]));
    else if (step.goal === 'accept') mv = legal.find((m) => clean(m.san) === clean(step.accept[0]));
    else if (step.goal === 'check') mv = legal.find((m) => /[+#]/.test(m.san));
    else if (step.goal === 'castle') mv = legal.find((m) => /[kq]/.test(m.flags) && (!step.side || m.flags.includes(step.side)));
    else if (step.goal === 'promote') mv = legal.find((m) => m.promotion);
    else if (step.goal === 'mate') { const san = mateIn(game, maxMoves - used); mv = legal.find((m) => m.san === san); }
    else mv = legal[0];
    if (!mv) return;
    state.sel = null;
    state.hints = state.hintLevel === mv.from ? [mv.from, mv.to] : [mv.from];
    state.hintLevel = mv.from;
    ui.say(state.hints.length === 1 ? 'Gợi ý: quân sáng đèn xanh nhé!' : 'Gợi ý: đi từ ô xanh này tới ô xanh kia!', '', true);
    redraw();
  }
  ui.setActions(
    h('button', { class: 'big-btn', onclick: () => speak(step.say) }, '🔊'),
    h('button', { class: 'big-btn', onclick: () => { if (!state.busy && !state.over) hint(); } }, '💡 Gợi ý'),
  );
}

// ---- Đánh với máy ----
function runPlay(step, ui) {
  let game = setupGame(step);
  const state = { sel: null, last: null, hints: null, busy: false, over: false };
  const bot = BOTS[step.bot] || BOTS[2];
  ui.say(step.say);
  const redraw = () => ui.area.replaceChildren(boardFor(game, state, (s) => tapper(game, state, ui, onMove, redraw)(s)));

  function lose(msg) {
    state.over = true;
    L.mistakes++;
    sound.bad();
    ui.say(msg, 'bad');
    ui.setActions(h('button', { class: 'big-btn primary', onclick: restart }, '🔁 Chơi lại'));
  }
  function restart() {
    game = setupGame(step);
    Object.assign(state, { sel: null, last: null, hints: null, busy: false, over: false });
    ui.say(step.say, '', false);
    setButtons();
    redraw();
  }
  function onMove(m) {
    if (step.goal === 'promote' && m.promotion) { state.over = true; redraw(); return ui.success('Tốt về đích thành Hậu rồi!'); }
    if (game.isCheckmate()) { state.over = true; redraw(); sound.win(); return ui.success(`CHIẾU HẾT! Con thắng ${bot.name} rồi!`); }
    if (game.isGameOver()) return lose(game.isStalemate() ? 'Hoà pat! Vua đen hết đường đi mà không bị chiếu. Nhớ chừa ô cho Vua đen nhé!' : 'Hoà rồi! Thử lại nhé.');
    state.busy = true;
    ui.say(`${bot.emoji} ${bot.name} đang nghĩ...`, '', false);
    later(() => {
      const r = game.move(bestMove(game, step.bot));
      state.last = [r.from, r.to]; state.busy = false; sound.move();
      redraw();
      if (game.isCheckmate()) return lose(`Ôi, ${bot.name} chiếu hết rồi! Không sao, chơi lại nhé!`);
      if (game.isGameOver()) return lose('Hoà rồi! Thử lại nhé.');
      if (step.goal === 'promote' && r.captured === 'p') return lose('Tốt bị ăn mất rồi! Thử lại nhé.');
      ui.say(game.inCheck() ? 'Cẩn thận! Vua con đang bị chiếu!' : 'Đến lượt con!', game.inCheck() ? 'bad' : '', game.inCheck());
    }, 350);
  }
  function undo() {
    if (state.busy || state.over || game.history().length < 2) return;
    // Bỏ nước của máy và của bé (chỉ khi bé đã đi ít nhất một nước).
    const startLen = setupGame(step).history().length;
    if (game.history().length - startLen < 2) return;
    game.undo(); game.undo();
    state.last = null; state.sel = null;
    L.hints++;
    redraw();
  }
  function hint() {
    if (state.busy || state.over) return;
    L.hints++;
    state.busy = true;
    ui.say('Cú Mèo đang nghĩ giúp con...', '', false);
    later(() => {
      const mv = bestMove(game, 2);
      state.busy = false; state.sel = null;
      state.hints = [mv.from, mv.to];
      ui.say('Thử đi từ ô xanh này tới ô xanh kia xem!', '', true);
      redraw();
    }, 50);
  }
  function setButtons() {
    ui.setActions(
      h('button', { class: 'big-btn', onclick: undo }, '↩️ Đi lại'),
      h('button', { class: 'big-btn', onclick: hint }, '💡 Gợi ý'),
    );
  }
  setButtons();
  redraw();
}

function finishLesson() {
  const penalty = L.mistakes + L.hints * 0.5;
  const stars = penalty < 1 ? 3 : penalty < 3 ? 2 : 1;
  const id = L.lesson.id;
  progress[id] = Math.max(progress[id] || 0, stars);
  store.set('progress', progress);
  updateTop();
  sound.win();
  confetti();
  const tired = Date.now() - sessionStart > BREAK_MS;
  const all = WORLDS.flatMap((w) => w.lessons.map((l) => ({ w, l })));
  const idx = all.findIndex((x) => x.l.id === id);
  const nxt = all[idx + 1];
  const nxtOpen = nxt && worldUnlocked(WORLDS.indexOf(nxt.w));
  const msg = tired
    ? 'Con học giỏi lắm rồi! Giờ nghỉ một chút: uống nước, vươn vai, nhảy 10 cái nhé! 💧🤸'
    : stars === 3 ? 'Hoàn hảo! Con là siêu sao cờ vua!' : 'Con hoàn thành bài rồi! Làm lại để được 3 sao nhé!';
  speak(msg);
  showModal(
    h('div', { class: 'big' }, tired ? '🧃' : '🏆'),
    h('h2', {}, 'Xong bài!'),
    h('div', { class: 'stars' }, '⭐'.repeat(stars) + '☆'.repeat(3 - stars)),
    h('p', {}, msg),
    h('div', { class: 'actions' },
      h('button', { class: 'big-btn', onclick: () => { hideModal(); showMap(); } }, '🗺️ Bản đồ'),
      !tired && nxtOpen ? h('button', { class: 'big-btn primary', onclick: () => { hideModal(); startLesson(nxt.w, nxt.l); } }, 'Bài tiếp ➜') : null,
      tired ? h('button', { class: 'big-btn primary', onclick: () => { sessionStart = Date.now(); hideModal(); showMap(); } }, 'Con nghỉ xong rồi!') : null,
    ),
  );
}

function showModal(...kids) { $('modal-card').replaceChildren(...kids); $('modal').classList.remove('hidden'); }
function hideModal() { $('modal').classList.add('hidden'); }

// ---------------- Khởi động ----------------
$('btn-home').addEventListener('click', () => { try { speechSynthesis.cancel(); } catch { /* */ } hideModal(); showMap(); });
const vb = $('btn-voice');
vb.textContent = voiceEnabled() ? '🔊' : '🔇';
vb.addEventListener('click', () => { vb.textContent = toggleVoice() ? '🔊' : '🔇'; });
showMap();

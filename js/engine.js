// Máy đánh cờ nhỏ: negamax + alpha-beta trên chess.js.
// Cấp 0 đi ngẫu nhiên, cấp càng cao nghĩ càng sâu và ít "nương tay".

const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
const MATE = 100000;

// Bảng vị trí (góc nhìn Trắng, hàng 8 ở trên). Khuyến khích chiếm trung tâm.
const CENTER = [
  0, 1, 2, 3, 3, 2, 1, 0,
  1, 2, 3, 4, 4, 3, 2, 1,
  2, 3, 4, 5, 5, 4, 3, 2,
  3, 4, 5, 6, 6, 5, 4, 3,
  3, 4, 5, 6, 6, 5, 4, 3,
  2, 3, 4, 5, 5, 4, 3, 2,
  1, 2, 3, 4, 4, 3, 2, 1,
  0, 1, 2, 3, 3, 2, 1, 0,
];

function evaluate(game) {
  // Điểm theo góc nhìn bên đang đi.
  let score = 0, material = 0;
  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (!p) continue;
      const sign = p.color === 'w' ? 1 : -1;
      if (p.type !== 'k') material += VAL[p.type];
      let v = VAL[p.type];
      const i = r * 8 + f;
      if (p.type === 'n' || p.type === 'b') v += CENTER[i] * 4;
      else if (p.type === 'p') {
        // Tốt giữa tiến lên thì tốt; Tốt biên đứng yên che Vua. Thưởng thêm khi gần phong cấp.
        const adv = p.color === 'w' ? 6 - r : r - 1;
        v += CENTER[i] * 3 + (adv >= 3 ? adv * 12 : 0);
      }
      else if (p.type === 'q') v += CENTER[i];
      score += sign * v;
    }
  }
  // Tàn cuộc: Vua ra giữa; bên yếu bị đẩy vào góc thì điểm kém đi.
  if (material < 1500) {
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (p && p.type === 'k') score += (p.color === 'w' ? 1 : -1) * CENTER[r * 8 + f] * 10;
    }
  }
  return game.turn() === 'w' ? score : -score;
}

function order(moves) {
  return moves.sort((a, b) => score(b) - score(a));
  function score(m) {
    let s = 0;
    if (m.captured) s += 10 * VAL[m.captured] - VAL[m.piece] + 1000;
    if (m.promotion) s += 900;
    if (m.san.includes('+')) s += 50;
    return s;
  }
}

function quiesce(game, alpha, beta, depth) {
  const stand = evaluate(game);
  if (stand >= beta) return beta;
  if (alpha < stand) alpha = stand;
  if (depth <= 0) return alpha;
  const caps = order(game.moves({ verbose: true }).filter((m) => m.captured || m.promotion));
  for (const m of caps) {
    game.move(m);
    const s = -quiesce(game, -beta, -alpha, depth - 1);
    game.undo();
    if (s >= beta) return beta;
    if (s > alpha) alpha = s;
  }
  return alpha;
}

let deadline = Infinity;
let nodes = 0;
class Timeout extends Error {}

export function search(game, depth, alpha, beta, ply, useQ) {
  if ((++nodes & 63) === 0 && Date.now() > deadline) throw new Timeout();
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return game.inCheck() ? -MATE + ply : 0;
  if (game.isInsufficientMaterial() || game.isThreefoldRepetition()) return 0;
  if (depth === 0) return useQ ? quiesce(game, alpha, beta, 2) : evaluate(game);
  for (const m of order(moves)) {
    game.move(m);
    const s = -search(game, depth - 1, -beta, -alpha, ply + 1, useQ);
    game.undo();
    if (s >= beta) return beta;
    if (s > alpha) alpha = s;
  }
  return alpha;
}

// time: giới hạn suy nghĩ (ms); máy nghĩ sâu dần và dùng kết quả của độ sâu cuối cùng xong.
const LEVELS = [
  { depth: 0, slack: Infinity },              // Gà Con: gần như ngẫu nhiên
  { depth: 1, slack: 150, q: true, time: 400 }, // Thỏ: ham ăn quân, hay sơ suất
  { depth: 2, slack: 40, q: true, time: 1200 },
  { depth: 3, slack: 10, q: true, time: 2000 },
  { depth: 5, slack: 0, q: true, time: 3000 },
];

// Trả về nước đi verbose của chess.js cho bên đang đi.
export function bestMove(game, level = 2) {
  const cfg = LEVELS[Math.max(0, Math.min(level, LEVELS.length - 1))];
  const moves = game.moves({ verbose: true });
  if (!moves.length) return null;
  if (cfg.depth === 0) {
    // Gà Con vẫn ăn quân nếu thấy (cho bé học bảo vệ quân), còn lại ngẫu nhiên.
    const caps = moves.filter((m) => m.captured);
    const pool = caps.length && Math.random() < 0.5 ? caps : moves;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  let done = null;
  let list = order(moves);
  const depth0 = game.history().length;
  deadline = Date.now() + (cfg.time || 1000);
  for (let d = 1; d <= cfg.depth; d++) {
    const scored = [];
    try {
      for (const m of list) {
        game.move(m);
        const s = -search(game, d - 1, -MATE - 1, MATE + 1, 1, cfg.q);
        game.undo();
        scored.push({ m, s });
      }
    } catch (e) {
      if (e instanceof Timeout) {
        // Ngắt giữa chừng: hoàn tác các nước đang thử dở.
        while (game.history().length > depth0) game.undo();
        break;
      }
      throw e;
    }
    scored.sort((a, b) => b.s - a.s);
    done = scored;
    list = scored.map((x) => x.m); // nước tốt nhất xét trước ở vòng sau
    if (scored[0].s > MATE - 100) break; // đã thấy chiếu hết
  }
  deadline = Infinity;
  if (!done) return list[0];
  const best = done[0].s;
  const ok = done.filter((x) => x.s >= best - cfg.slack);
  return ok[Math.floor(Math.random() * ok.length)].m;
}

// Có chiếu hết được trong n nước (của bên đang đi) không? Dùng để kiểm tra bài tập.
export function mateIn(game, n) {
  for (const m of game.moves({ verbose: true })) {
    game.move(m);
    let ok;
    if (game.isCheckmate()) ok = true;
    else if (n === 1 || game.isGameOver()) ok = false;
    else {
      ok = true;
      for (const r of game.moves({ verbose: true })) {
        game.move(r);
        const sub = mateIn(game, n - 1);
        game.undo();
        if (!sub) { ok = false; break; }
      }
    }
    game.undo();
    if (ok) return m.san;
  }
  return null;
}

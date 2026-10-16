// Luật đi của một quân cờ đơn lẻ trên bàn trống (dùng cho bài "ăn sao")
// và cho phần minh hoạ nước đi trong slide.

export const FILES = 'abcdefgh';

export function sq(f, r) { return FILES[f] + (r + 1); }
export function parse(s) { return [FILES.indexOf(s[0]), Number(s[1]) - 1]; }
export function isLight(s) { const [f, r] = parse(s); return (f + r) % 2 === 1; }

const DIRS = {
  r: [[1, 0], [-1, 0], [0, 1], [0, -1]],
  b: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
};
DIRS.q = [...DIRS.r, ...DIRS.b];
DIRS.k = DIRS.q;
const KNIGHT = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];

// piece: 'r','b','q','k','n','p' (quân trắng). blocked(s) -> true nếu có đá/quân mình.
// enemy(s) -> true nếu có quân đen ở đó (ăn được, nhưng chặn đường).
export function targets(piece, from, blocked = () => false, enemy = () => false) {
  const [f, r] = parse(from);
  const out = [];
  const inside = (x, y) => x >= 0 && x < 8 && y >= 0 && y < 8;
  if (piece === 'n') {
    for (const [dx, dy] of KNIGHT) {
      const x = f + dx, y = r + dy;
      if (inside(x, y) && !blocked(sq(x, y))) out.push(sq(x, y));
    }
  } else if (piece === 'p') {
    const one = sq(f, r + 1);
    if (r < 7 && !blocked(one) && !enemy(one)) {
      out.push(one);
      const two = r === 1 ? sq(f, r + 2) : null;
      if (two && !blocked(two) && !enemy(two)) out.push(two);
    }
    for (const dx of [-1, 1]) {
      const x = f + dx, y = r + 1;
      if (inside(x, y) && enemy(sq(x, y))) out.push(sq(x, y));
    }
  } else {
    const slide = piece !== 'k';
    for (const [dx, dy] of DIRS[piece]) {
      let x = f + dx, y = r + dy;
      while (inside(x, y)) {
        const s = sq(x, y);
        if (blocked(s)) break;
        out.push(s);
        if (enemy(s) || !slide) break;
        x += dx; y += dy;
      }
    }
  }
  return out;
}

// Số nước ít nhất để ăn hết sao + quân địch. Trả về null nếu không giải được.
export function solveStars(task) {
  const goals = [...task.stars, ...Object.keys(task.enemies || {})];
  const rocks = new Set(task.rocks || []);
  const full = (1 << goals.length) - 1;
  const start = { at: task.from, piece: task.piece, mask: 0 };
  const key = (s) => s.at + s.piece + s.mask;
  const seen = new Set([key(start)]);
  let frontier = [start];
  for (let depth = 0; frontier.length; depth++) {
    const next = [];
    for (const st of frontier) {
      if (st.mask === full) return depth;
      const alive = (s) => {
        const i = goals.indexOf(s);
        return i >= task.stars.length && !(st.mask & (1 << i));
      };
      for (const to of targets(st.piece, st.at, (s) => rocks.has(s), alive)) {
        let mask = st.mask;
        const i = goals.indexOf(to);
        if (i >= 0) mask |= 1 << i;
        const piece = st.piece === 'p' && to[1] === '8' ? 'q' : st.piece;
        const ns = { at: to, piece, mask };
        if (!seen.has(key(ns))) { seen.add(key(ns)); next.push(ns); }
      }
    }
    frontier = next;
  }
  return null;
}

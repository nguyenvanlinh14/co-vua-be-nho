// Kiểm tra toàn bộ giáo trình: node tools/verify.mjs
import { Chess } from '../vendor/chess.js';
import { WORLDS } from '../js/lessons.js';
import { solveStars, isLight } from '../js/stars.js';
import { mateIn, bestMove } from '../js/engine.js';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const clean = (s) => s.replace(/[+#]/g, '');
let errors = 0;
const fail = (where, msg) => { errors++; console.log(`✗ ${where}: ${msg}`); };

function setup(step) {
  const g = new Chess(step.fen || START);
  for (const m of step.start || []) g.move(m);
  return g;
}

for (const w of WORLDS) for (const l of w.lessons) l.steps.forEach((step, i) => {
  const where = `${l.id}#${i} (${step.type})`;
  try {
    if (step.type === 'slide' && step.board?.fen) new Chess(step.board.fen);
    if (step.type === 'stars') {
      const n = solveStars(step);
      if (n === null) fail(where, 'không giải được');
      if (step.piece === 'b') for (const s of step.stars) if (isLight(s) !== isLight(step.from)) fail(where, `sao ${s} khác màu ô`);
    }
    if (step.type === 'puzzle' || step.type === 'play') {
      const g = setup(step);
      if (g.turn() !== 'w') fail(where, 'không phải lượt Trắng');
      if (g.isGameOver()) fail(where, 'thế cờ đã kết thúc');
      const legal = g.moves().map(clean);
      if (step.goal === 'solution') {
        for (const m of step.solution) g.move(m);
        const last = step.solution.at(-1);
        // Nước cuối của bé có còn cách khác thắng bằng không? Chỉ cảnh báo.
        void last;
      }
      if (step.goal === 'accept') for (const m of step.accept) if (!legal.includes(clean(m))) fail(where, `${m} không hợp lệ`);
      if (step.goal === 'check' && !g.moves().some((m) => m.includes('+') || m.includes('#'))) fail(where, 'không có nước chiếu');
      if (step.goal === 'escape' && !g.inCheck()) fail(where, 'Vua trắng chưa bị chiếu');
      if (step.goal === 'castle' && !g.moves({ verbose: true }).some((m) => /[kq]/.test(m.flags) && (!step.side || m.flags.includes(step.side)))) fail(where, 'không nhập thành được');
      if (step.goal === 'promote' && step.type === 'puzzle' && !g.moves({ verbose: true }).some((m) => m.promotion)) fail(where, 'không phong cấp được');
      if (step.goal === 'mate' && step.type === 'puzzle') {
        const n = step.maxMoves || 1;
        const sol = mateIn(g, n);
        if (!sol) fail(where, `không có chiếu hết trong ${n}`);
        else if (n > 1 && mateIn(g, n - 1)) fail(where, `dễ hơn dự kiến: chiếu hết trong ${n - 1}`);
        else console.log(`  ${where}: ${sol}`);
      }
    }
  } catch (e) { fail(where, e.message); }
});

// Thử nhanh máy: mỗi cấp chọn được nước, không quá chậm.
const g = new Chess(START);
for (let lv = 0; lv <= 4; lv++) {
  const t = Date.now();
  const m = bestMove(g, lv);
  console.log(`  bot ${lv}: ${m.san} (${Date.now() - t}ms)`);
}
const mid = new Chess('r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5');
for (let lv = 3; lv <= 4; lv++) { const t = Date.now(); const m = bestMove(mid, lv); console.log(`  bot ${lv} trung cuộc: ${m.san} (${Date.now() - t}ms)`); }

console.log(errors ? `\n${errors} lỗi` : '\nTất cả bài tập hợp lệ ✓');
process.exit(errors ? 1 : 0);

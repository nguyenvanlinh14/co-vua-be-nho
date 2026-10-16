// Tạo sẵn giọng đọc Cú Mèo bằng Gemini TTS → audio/*.m4a + audio/manifest.json
//
//   GEMINI_API_KEY=... node tools/tts.mjs            # tạo các câu còn thiếu
//   GEMINI_API_KEY=... node tools/tts.mjs --test 3   # tạo 3 câu vào thư mục tạm và cho Gemini nghe lại
//
// Key chỉ dùng trên máy khi tạo file; KHÔNG đưa key vào repo hay vào trang web.
// Cần macOS (dùng afconvert để nén sang AAC).

import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLDS, BOTS } from '../js/lessons.js';
import { say, speechKey } from '../js/phrases.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEY = process.env.GEMINI_API_KEY;
// Hết quota ngày ở model này thì tự chuyển sang model sau (cùng giọng).
const TTS_MODELS = (process.env.TTS_MODELS || 'gemini-3.8-flash-tts,gemini-3.8-flash-lite-tts,gemini-3.1-flash-tts-preview,gemini-2.5-flash-preview-tts').split(',');
let modelIdx = 0;
class QuotaExhausted extends Error {}
const CHECK_MODEL = 'gemini-3.8-flash';
const VOICE = process.env.TTS_VOICE || 'Leda';
// Chỉ dẫn phong cách theo dạng "ghi chú đạo diễn"; mô hình chỉ đọc phần TRANSCRIPT.
const DIRECTION = [
  '# AUDIO PROFILE: Cú Mèo – a warm, kind Vietnamese kindergarten teacher.',
  '## THE SCENE: Teaching chess to a 6-year-old child with a short attention span.',
  '### DIRECTOR\'S NOTES',
  'Style: gentle, cheerful, encouraging, smiling. Pace: slow and clear, short pauses between sentences.',
  'Language: Vietnamese (Northern accent). Read only the transcript, nothing else.',
  '#### TRANSCRIPT',
].join('\n');
const API = 'https://generativelanguage.googleapis.com/v1beta/models';

if (!KEY) { console.error('Thiếu GEMINI_API_KEY'); process.exit(1); }

// ---- Gom mọi câu Cú Mèo có thể nói ----
function collect() {
  const out = new Set();
  const add = (t) => { const k = speechKey(t); if (k) out.add(k); };
  let maxMate = 1;
  const pieces = new Set();
  for (const w of WORLDS) for (const l of w.lessons) for (const st of l.steps) {
    if (st.say) add(st.say);
    if (st.type === 'find') { add(say.findAsk(st.square)); add(say.findRight(st.square)); add(say.findWrong(st.square)); }
    if (st.type === 'stars') { add(say.starsIntro(st)); pieces.add(st.piece); }
    if (st.maxMoves) maxMate = Math.max(maxMate, st.maxMoves);
  }
  for (const p of pieces) add(say.starsBlocked(p));
  for (let n = 1; n < maxMate; n++) add(say.mateLeft(n));
  for (const b of BOTS) { add(say.botWin(b)); add(say.botLose(b)); }
  // Câu cố định trong main.js: chuỗi tiếng Việt kết thúc bằng ! . ?
  const src = readFileSync(join(ROOT, 'js/main.js'), 'utf8');
  for (const m of src.matchAll(/'([^'\n]*[À-ỹ][^'\n]*[!.?])'/g)) add(m[1]);
  return [...out];
}

const fileFor = (key) => createHash('sha1').update(`${VOICE}|${key}`).digest('hex').slice(0, 12) + '.m4a';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(model, body) {
  for (let attempt = 1; ; attempt++) {
    let res, data;
    try {
      res = await fetch(`${API}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(90_000), // tránh request treo mãi
      });
      data = await res.json();
    } catch (e) { data = { error: { message: String(e) } }; }
    if (res?.ok) return data;
    const msg = data?.error?.message || res?.status;
    if (attempt >= 6) throw new Error(msg);
    const retry = data?.error?.details?.find((d) => d.retryDelay)?.retryDelay;
    if (res?.status === 429 && retry && parseFloat(retry) > 120) throw new QuotaExhausted(model);
    const wait = retry ? parseFloat(retry) * 1000 + 500 : 2000 * 2 ** attempt;
    console.log(`  … thử lại sau ${Math.round(wait / 1000)}s (${String(msg).slice(0, 80)})`);
    await sleep(wait);
  }
}

async function synth(text, outPath) {
  let data;
  for (;;) {
    const model = TTS_MODELS[modelIdx];
    if (!model) throw new Error('Mọi model TTS đều hết quota hôm nay');
    try { data = await call(model, ttsBody(text)); break; }
    catch (e) {
      if (!(e instanceof QuotaExhausted)) throw e;
      if (TTS_MODELS[modelIdx] === model) { modelIdx++; console.log(`  ⇢ ${model} hết quota, chuyển sang ${TTS_MODELS[modelIdx] || '(hết)'}`); }
    }
  }
  return saveAudio(data, outPath);
}

function ttsBody(text) {
  return {
    contents: [{ parts: [{ text: `${DIRECTION}\n${text}` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
    },
  };
}

function saveAudio(data, outPath) {
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error('Không có audio trả về');
  let buf = Buffer.from(part.inlineData.data, 'base64');
  const tmp = mkdtempSync(join(tmpdir(), 'tts-'));
  if (buf.subarray(0, 4).toString() !== 'RIFF') buf = wavHeader(buf); // PCM thô 24kHz
  writeFileSync(join(tmp, 'a.wav'), buf);
  execFileSync('afconvert', [join(tmp, 'a.wav'), outPath, '-f', 'm4af', '-d', 'aac', '-b', '48000']);
}

function wavHeader(pcm, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

async function transcribe(path) {
  const data = await call(CHECK_MODEL, {
    contents: [{ parts: [
      { inlineData: { mimeType: 'audio/mp4', data: readFileSync(path).toString('base64') } },
      { text: 'Chép lại chính xác từng chữ được nói trong đoạn âm thanh, giữ nguyên ngôn ngữ. Chỉ trả về lời thoại.' },
    ] }],
  });
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
}

// Nghe lại: nếu mô hình đọc lẫn phần chỉ dẫn hoặc đọc dài bất thường thì tạo lại.
const LEAK = /\b(audio|profile|scene|director|style|transcript|teacher|kindergarten|say|slowly)\b/i;
async function synthChecked(text, outPath) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    await synth(text, outPath);
    const heard = (await transcribe(outPath)) || '';
    if (!LEAK.test(heard) && heard.length <= text.length * 1.5 + 15) return;
    console.log(`  ↻ đọc sai (${heard.slice(0, 60)}…), tạo lại`);
  }
  throw new Error('Không tạo được bản đọc sạch');
}

const phrases = collect();
const testN = process.argv.includes('--test') ? Number(process.argv[process.argv.indexOf('--test') + 1] || 3) : 0;

if (testN) {
  const dir = mkdtempSync(join(tmpdir(), 'tts-test-'));
  for (const p of phrases.slice(0, testN)) {
    const f = join(dir, fileFor(p));
    await synth(p, f);
    console.log(`\nGỐC : ${p}\nNGHE: ${await transcribe(f)}\nFILE: ${f}`);
  }
  process.exit(0);
}

const outDir = join(ROOT, 'audio');
mkdirSync(outDir, { recursive: true });
const manifest = {};
let made = 0, failed = 0;
console.log(`${phrases.length} câu, giọng ${VOICE}, model ${TTS_MODELS.join(' → ')}`);
const queue = [...phrases];
async function worker() {
  while (queue.length) {
    const p = queue.shift();
    const file = fileFor(p);
    try {
      if (!existsSync(join(outDir, file))) { await synthChecked(p, join(outDir, file)); made++; console.log(`✓ ${p}`); }
      manifest[p] = file;
    } catch (e) { failed++; console.log(`✗ ${p}: ${e.message}`); }
  }
}
await Promise.all([worker(), worker(), worker()]);
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify({ voice: VOICE, files: sorted }, null, 1));
console.log(`\nXong: tạo mới ${made}, có sẵn ${Object.keys(manifest).length - made}, lỗi ${failed}`);
process.exit(failed ? 1 : 0);

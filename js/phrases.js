// Các câu nói có phần thay đổi (tên ô, tên máy...). Dùng chung cho app và cho
// tools/tts.mjs để tạo sẵn file giọng đọc cho mọi biến thể.

export const PIECE_NAMES = { r: 'Xe', b: 'Tượng', q: 'Hậu', k: 'Vua', n: 'Mã', p: 'Tốt' };

export const say = {
  findAsk: (sq) => `Con hãy chạm vào ô ${sq.toUpperCase()}!`,
  findRight: (sq) => `Đúng rồi! Đó là ô ${sq.toUpperCase()}.`,
  findWrong: (sq) => `Chưa đúng. Tìm chữ ${sq[0].toUpperCase()} ở dưới và số ${sq[1]} ở bên nhé!`,
  starsIntro(step) {
    const name = PIECE_NAMES[step.piece];
    const enemies = Object.keys(step.enemies || {}).length;
    const n = step.stars.length + enemies;
    if (!step.stars.length) return `${name} ơi, ăn quân đen đi! Chạm vào ô có vòng xanh.`;
    return `${name} ơi, đi ăn hết ${n > 1 ? n + ' ' : ''}${enemies ? 'món' : 'ngôi sao'} nào! Chạm vào chấm xanh để đi.`;
  },
  starsBlocked: (piece) => `${PIECE_NAMES[piece]} không đi tới ô đó được. Nhìn các chấm xanh nhé!`,
  mateLeft: (n) => `Còn ${n} nước để chiếu hết!`,
  botWin: (bot) => `CHIẾU HẾT! Con thắng ${bot.name} rồi!`,
  botLose: (bot) => `Ôi, ${bot.name} chiếu hết rồi! Không sao, chơi lại nhé!`,
};

// Khoá tra file giọng: bỏ emoji/ký hiệu cờ, gộp khoảng trắng.
export function speechKey(text) {
  return text
    .replace(/[\p{Extended_Pictographic}️‍♔-♟]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

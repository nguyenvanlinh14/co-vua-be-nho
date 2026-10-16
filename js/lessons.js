// Giáo trình: mỗi "thế giới" có vài bài ngắn (3–6 bước) để bé không mỏi.
//
// Các loại bước:
//  slide   – Cú Mèo nói + (tuỳ chọn) bàn cờ minh hoạ
//  find    – chạm vào ô có tên cho trước
//  choose  – chọn 1 đáp án
//  stars   – một quân đi ăn hết ngôi sao ⭐ (và quân đen)
//  puzzle  – thế cờ thật, goal: solution | accept | check | escape | castle | promote | mate
//  play    – đánh với máy, goal: promote | mate

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const WORLDS = [
  {
    id: 'w1', title: 'Bàn cờ thần kỳ', emoji: '🏰', color: '#ffb84d',
    lessons: [
      {
        id: 'hello', title: 'Xin chào bàn cờ', emoji: '👋',
        steps: [
          { type: 'slide', say: 'Chào con! Mình là Cú Mèo. Hôm nay mình cùng chơi cờ vua nhé!', emoji: '🦉' },
          { type: 'slide', say: 'Đây là bàn cờ. Có 64 ô vuông: ô sáng và ô tối nằm xen kẽ nhau.', board: { pieces: {} } },
          { type: 'slide', say: 'Mỗi bên có 16 quân. Con cầm quân Trắng ở dưới. Bên Trắng luôn đi trước!', board: { fen: START } },
          { type: 'choose', say: 'Bên nào được đi trước?', options: ['⚪ Trắng', '⚫ Đen'], answer: 0 },
        ],
      },
      {
        id: 'squares', title: 'Tìm ô bí mật', emoji: '🔍',
        steps: [
          { type: 'slide', say: 'Mỗi ô có một cái tên: chữ cái ở dưới, con số ở bên cạnh. Ô sáng đèn này tên là e4!', board: { pieces: {}, marks: ['e4'] } },
          { type: 'find', square: 'a1' },
          { type: 'find', square: 'h8' },
          { type: 'find', square: 'e4' },
          { type: 'find', square: 'd5' },
          { type: 'find', square: 'c3' },
        ],
      },
    ],
  },
  {
    id: 'w2', title: 'Gặp gỡ các quân cờ', emoji: '♟️', color: '#7bd389',
    lessons: [
      {
        id: 'rook', title: 'Xe – đi thẳng', emoji: '🏰',
        steps: [
          { type: 'slide', say: 'Đây là Xe. Xe đi thẳng: lên, xuống, sang trái, sang phải. Đi xa bao nhiêu cũng được!', board: { pieces: { d4: 'R' }, showMoves: 'd4' } },
          { type: 'stars', piece: 'r', from: 'a1', stars: ['a6'] },
          { type: 'stars', piece: 'r', from: 'a1', stars: ['a8', 'h8'] },
          { type: 'stars', piece: 'r', from: 'b2', stars: ['b7', 'g7', 'g2'], rocks: ['b5', 'e7'] },
        ],
      },
      {
        id: 'bishop', title: 'Tượng – đi chéo', emoji: '⛪',
        steps: [
          { type: 'slide', say: 'Đây là Tượng. Tượng đi chéo. Tượng ở ô sáng thì mãi mãi ở ô sáng!', board: { pieces: { d4: 'B' }, showMoves: 'd4' } },
          { type: 'stars', piece: 'b', from: 'c1', stars: ['g5'] },
          { type: 'stars', piece: 'b', from: 'c1', stars: ['h6', 'f8'] },
          { type: 'stars', piece: 'b', from: 'f1', stars: ['b5', 'e8', 'h5'], rocks: ['d3'] },
        ],
      },
      {
        id: 'queen', title: 'Hậu – siêu mạnh', emoji: '👸',
        steps: [
          { type: 'slide', say: 'Đây là Hậu, quân mạnh nhất! Hậu đi thẳng như Xe và đi chéo như Tượng.', board: { pieces: { d4: 'Q' }, showMoves: 'd4' } },
          { type: 'stars', piece: 'q', from: 'd1', stars: ['d7', 'h3'] },
          { type: 'stars', piece: 'q', from: 'a1', stars: ['h8', 'h1', 'a8'] },
          { type: 'stars', piece: 'q', from: 'e1', stars: ['b4', 'f8', 'h2', 'a7'], rocks: ['e4', 'c3'] },
        ],
      },
      {
        id: 'king', title: 'Vua – đi từng bước', emoji: '🤴',
        steps: [
          { type: 'slide', say: 'Đây là Vua, quân quan trọng nhất! Vua đi 1 ô về mọi hướng.', board: { pieces: { d4: 'K' }, showMoves: 'd4' } },
          { type: 'stars', piece: 'k', from: 'e1', stars: ['e3'] },
          { type: 'stars', piece: 'k', from: 'e1', stars: ['f2', 'g3', 'h3'] },
          { type: 'stars', piece: 'k', from: 'd4', stars: ['c5', 'e5', 'e3', 'c3'] },
        ],
      },
      {
        id: 'knight', title: 'Mã – nhảy chữ L', emoji: '🐴',
        steps: [
          { type: 'slide', say: 'Đây là Mã. Mã nhảy hình chữ L: 2 ô thẳng rồi 1 ô ngang. Mã nhảy qua đầu các quân khác được!', board: { pieces: { d4: 'N' }, showMoves: 'd4' } },
          { type: 'stars', piece: 'n', from: 'b1', stars: ['c3'] },
          { type: 'stars', piece: 'n', from: 'g1', stars: ['f3', 'e5'] },
          { type: 'stars', piece: 'n', from: 'b1', stars: ['c3', 'd5', 'b6'], rocks: ['a2', 'b2', 'c2', 'd2'] },
          { type: 'stars', piece: 'n', from: 'a1', stars: ['b3', 'd4', 'f5', 'h6'] },
        ],
      },
      {
        id: 'pawn', title: 'Tốt – chiến binh nhỏ', emoji: '💂',
        steps: [
          { type: 'slide', say: 'Đây là Tốt. Tốt đi thẳng 1 ô. Lần đầu tiên, Tốt được đi 2 ô!', board: { pieces: { e2: 'P' }, showMoves: 'e2' } },
          { type: 'stars', piece: 'p', from: 'e2', stars: ['e5'] },
          { type: 'slide', say: 'Tốt ăn quân theo đường chéo, 1 ô về phía trước.', board: { pieces: { d4: 'P', e5: 'n', c5: 'b', d5: 'p' }, marks: ['e5', 'c5'] } },
          { type: 'stars', piece: 'p', from: 'd2', stars: [], enemies: { e3: 'n' } },
          { type: 'stars', piece: 'p', from: 'c4', stars: [], enemies: { d5: 'p', e6: 'b' } },
          { type: 'slide', say: 'Phép thuật! Tốt đi đến hàng cuối cùng sẽ biến thành Hậu!', emoji: '✨👸' },
          { type: 'stars', piece: 'p', from: 'a5', stars: ['a8', 'h1'] },
        ],
      },
      {
        id: 'values', title: 'Quân nào mạnh?', emoji: '💪',
        steps: [
          { type: 'slide', say: 'Mỗi quân có sức mạnh khác nhau. Tốt: 1 điểm. Mã và Tượng: 3 điểm. Xe: 5 điểm. Hậu: 9 điểm!', emoji: '♟=1 ♞=3 ♝=3 ♜=5 ♛=9' },
          { type: 'choose', say: 'Quân nào mạnh nhất?', options: ['♛ Hậu', '♜ Xe', '♟ Tốt'], answer: 0 },
          { type: 'choose', say: 'Xe hay Mã mạnh hơn?', options: ['♞ Mã', '♜ Xe'], answer: 1 },
          { type: 'choose', say: 'Vua có bị ăn không?', options: ['Có', 'Không bao giờ!'], answer: 1 },
        ],
      },
    ],
  },
  {
    id: 'w3', title: 'Ăn quân', emoji: '🍪', color: '#ff8fa3',
    lessons: [
      {
        id: 'capture1', title: 'Ăn quân miễn phí', emoji: '😋',
        steps: [
          { type: 'slide', say: 'Đi vào ô có quân đen là ăn được quân đó! Hãy ăn những quân không ai bảo vệ.', emoji: '🍪' },
          { type: 'puzzle', say: 'Xe ơi, ăn Hậu đen đi!', fen: '8/8/3k4/8/3q4/8/3R4/4K3 w - - 0 1', goal: 'solution', solution: ['Rxd4'] },
          { type: 'puzzle', say: 'Tượng ăn Xe đen nào!', fen: '4k3/8/8/8/5r2/8/3B4/4K3 w - - 0 1', goal: 'solution', solution: ['Bxf4'] },
          { type: 'puzzle', say: 'Mã nhảy chữ L ăn Hậu!', fen: '4k3/8/8/3q4/8/2N5/8/4K3 w - - 0 1', goal: 'solution', solution: ['Nxd5'] },
          { type: 'puzzle', say: 'Tốt ăn chéo con Mã!', fen: '4k3/8/8/8/3n4/4P3/8/4K3 w - - 0 1', goal: 'solution', solution: ['exd4'] },
        ],
      },
      {
        id: 'capture2', title: 'Cẩn thận bẫy!', emoji: '🪤',
        steps: [
          { type: 'slide', say: 'Cẩn thận! Nếu quân đen có bạn bảo vệ, con ăn xong sẽ bị ăn lại. Hãy chọn quân KHÔNG ai bảo vệ.', emoji: '🤔' },
          { type: 'puzzle', say: 'Hậu nên ăn quân nào? Tượng có Tốt bảo vệ đấy!', fen: '4k3/8/8/7p/r5b1/8/8/3QK3 w - - 0 1', goal: 'solution', solution: ['Qxa4'] },
          { type: 'puzzle', say: 'Mã nên ăn quân nào cho an toàn?', fen: '4k3/8/2p5/1p6/4r3/2N5/8/6K1 w - - 0 1', goal: 'solution', solution: ['Nxe4'] },
        ],
      },
    ],
  },
  {
    id: 'w4', title: 'Chiếu tướng', emoji: '⚔️', color: '#8ec5ff',
    lessons: [
      {
        id: 'check', title: 'Chiếu Vua', emoji: '👉',
        steps: [
          { type: 'slide', say: 'Khi một quân tấn công Vua đối phương, ta gọi là CHIẾU! Vua phải chạy ngay.', board: { fen: '4k3/8/8/8/8/8/8/4R1K1 b - - 0 1', marks: ['e8'] } },
          { type: 'puzzle', say: 'Dùng Xe chiếu Vua đen!', fen: '4k3/8/8/8/8/8/8/R3K3 w - - 0 1', goal: 'check' },
          { type: 'puzzle', say: 'Dùng Tượng chiếu Vua đen!', fen: '4k3/7p/8/8/8/8/8/4KB2 w - - 0 1', goal: 'check' },
          { type: 'puzzle', say: 'Dùng Mã chiếu Vua đen!', fen: '4k3/7p/8/8/4N3/8/8/4K3 w - - 0 1', goal: 'check' },
        ],
      },
      {
        id: 'escape', title: 'Cứu Vua!', emoji: '🛡️',
        steps: [
          { type: 'slide', say: 'Vua mình bị chiếu thì có 3 cách: CHẠY đi, CHẶN lại, hoặc ĂN quân đang chiếu.', emoji: '🏃 🧱 😋' },
          { type: 'puzzle', say: 'Vua bị Xe chiếu! Con cứu Vua nhé.', fen: '4k3/8/8/8/8/8/4r3/4K3 w - - 0 1', goal: 'escape' },
          { type: 'puzzle', say: 'Vua bị chiếu! Thử CHẶN bằng Tượng xem.', fen: '4k3/4r3/8/8/8/8/3B4/4K3 w - - 0 1', goal: 'solution', solution: ['Be3'] },
          { type: 'puzzle', say: 'Vua bị chiếu! Con ĂN quân đang chiếu đi.', fen: '4k3/8/8/8/8/8/8/R2qK3 w - - 0 1', goal: 'escape' },
        ],
      },
    ],
  },
  {
    id: 'w5', title: 'Chiếu hết!', emoji: '🏆', color: '#c39bff',
    lessons: [
      {
        id: 'mate1', title: 'Chiếu hết là thắng', emoji: '🎉',
        steps: [
          { type: 'slide', say: 'CHIẾU HẾT là khi Vua bị chiếu mà không còn đường thoát. Ai chiếu hết là THẮNG!', board: { fen: '6Rk/6pp/8/8/8/8/8/6K1 b - - 0 1', marks: ['h8'] } },
          { type: 'puzzle', say: 'Chiếu hết bằng Xe! Vua đen bị Tốt nhà mình chặn rồi.', fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1', goal: 'mate' },
          { type: 'puzzle', say: 'Chiếu hết bằng Xe! Vua trắng giúp một tay.', fen: '7k/8/6K1/8/8/8/8/R7 w - - 0 1', goal: 'mate' },
          { type: 'puzzle', say: 'Hậu chiếu hết! Vua trắng đứng gần bảo vệ.', fen: '4k3/8/4K3/8/8/8/8/Q7 w - - 0 1', goal: 'mate' },
        ],
      },
      {
        id: 'mate2', title: 'Thám tử chiếu hết', emoji: '🕵️',
        steps: [
          { type: 'puzzle', say: 'Hai Xe làm cầu thang. Chiếu hết nào!', fen: '7k/R7/8/8/8/8/8/1R4K1 w - - 0 1', goal: 'mate' },
          { type: 'puzzle', say: 'Mã chiếu hết! Vua đen bị quân nhà chặn kín.', fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', goal: 'mate' },
          { type: 'puzzle', say: 'Hậu chiếu hết. Hậu được Vua bảo vệ!', fen: 'k7/8/1K6/8/8/8/8/7Q w - - 0 1', goal: 'mate' },
          { type: 'puzzle', say: 'Thế cờ nổi tiếng! Hậu và Tượng chiếu hết ở ô f7.', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', goal: 'mate' },
          { type: 'puzzle', say: 'Xe ăn Xe và chiếu hết!', fen: '4r1k1/5ppp/8/8/8/4R3/5PPP/4R1K1 w - - 0 1', goal: 'mate' },
        ],
      },
    ],
  },
  {
    id: 'w6', title: 'Nước đi đặc biệt', emoji: '✨', color: '#ffd166',
    lessons: [
      {
        id: 'castle', title: 'Nhập thành', emoji: '🏯',
        steps: [
          { type: 'slide', say: 'Nhập thành: Vua đi 2 ô về phía Xe, Xe nhảy qua đứng cạnh Vua. Vua được an toàn trong lâu đài!', board: { fen: '4k3/8/8/8/8/8/5PPP/5RK1 w - - 0 1', marks: ['g1', 'f1'] } },
          { type: 'puzzle', say: 'Nhập thành cánh Vua! Bấm Vua rồi bấm ô g1.', fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1', goal: 'castle', side: 'k' },
          { type: 'puzzle', say: 'Nhập thành cánh Hậu! Bấm Vua rồi bấm ô c1.', fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1', goal: 'castle', side: 'q' },
        ],
      },
      {
        id: 'promote', title: 'Phong Hậu', emoji: '👑',
        steps: [
          { type: 'slide', say: 'Tốt đi đến hàng cuối sẽ biến thành Hậu. Gọi là PHONG CẤP!', emoji: '♟️➡️♛' },
          { type: 'puzzle', say: 'Đẩy Tốt lên phong Hậu!', fen: '4k3/1P6/8/8/8/8/8/4K3 w - - 0 1', goal: 'promote' },
          { type: 'puzzle', say: 'Tốt ăn chéo và phong Hậu luôn!', fen: '3r2k1/2P5/8/8/8/8/8/6K1 w - - 0 1', goal: 'solution', solution: ['cxd8=Q+'] },
        ],
      },
      {
        id: 'enpassant', title: 'Bắt tốt qua đường', emoji: '🚶',
        steps: [
          { type: 'slide', say: 'Tốt đen vừa nhảy 2 ô đứng ngay cạnh Tốt trắng. Tốt trắng được ăn chéo như thể Tốt đen chỉ đi 1 ô!', board: { fen: '4k3/8/8/3Pp3/8/8/8/4K3 w - e6 0 2', marks: ['e6'] } },
          { type: 'puzzle', say: 'Tốt đen vừa đi e7 lên e5. Bắt tốt qua đường đi!', fen: '4k3/8/8/3Pp3/8/8/8/4K3 w - e6 0 2', goal: 'solution', solution: ['dxe6'] },
        ],
      },
    ],
  },
  {
    id: 'w7', title: 'Khai cuộc', emoji: '🌅', color: '#ff9f68',
    lessons: [
      {
        id: 'opening', title: '3 bí kíp mở màn', emoji: '📜',
        steps: [
          { type: 'slide', say: 'Bí kíp 1: Đưa Tốt vào giữa bàn cờ. Bí kíp 2: Cho Mã và Tượng ra trận. Bí kíp 3: Nhập thành giữ Vua an toàn!', emoji: '1️⃣ 2️⃣ 3️⃣' },
          { type: 'puzzle', say: 'Bí kíp 1: Đẩy một Tốt vào giữa bàn cờ!', fen: START, goal: 'accept', accept: ['e4', 'd4'] },
          { type: 'puzzle', say: 'Bí kíp 2: Cho Mã ra trận!', start: ['e4', 'e5'], goal: 'accept', accept: ['Nf3', 'Nc3'] },
          { type: 'puzzle', say: 'Bí kíp 2: Cho Tượng ra trận!', start: ['e4', 'e5', 'Nf3', 'Nc6'], goal: 'accept', accept: ['Bc4', 'Bb5'] },
          { type: 'puzzle', say: 'Bí kíp 3: Nhập thành ngay!', start: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'], goal: 'castle' },
        ],
      },
    ],
  },
  {
    id: 'w8', title: 'Chiến thuật', emoji: '🧠', color: '#5ec8c8',
    lessons: [
      {
        id: 'fork', title: 'Chĩa đôi', emoji: '🍴',
        steps: [
          { type: 'slide', say: 'Chĩa đôi: một quân tấn công HAI quân cùng lúc. Đối phương chỉ cứu được một!', emoji: '🍴' },
          { type: 'puzzle', say: 'Mã chiếu Vua và tấn công Xe cùng lúc!', fen: 'r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1', goal: 'solution', solution: ['Nc7+', 'Ke7', 'Nxa8'] },
          { type: 'puzzle', say: 'Hậu chiếu Vua và tấn công Xe cùng lúc!', fen: 'r5k1/8/8/8/8/8/8/3QK3 w - - 0 1', goal: 'solution', solution: ['Qd5+', 'Kh8', 'Qxa8+'] },
          { type: 'puzzle', say: 'Tốt nhỏ tấn công cả Mã và Tượng!', fen: '4k3/8/8/2n1b3/8/2PP4/8/4K3 w - - 0 1', goal: 'solution', solution: ['d4', 'Nd7', 'dxe5'] },
        ],
      },
      {
        id: 'pin', title: 'Ghim và Xiên', emoji: '📌',
        steps: [
          { type: 'slide', say: 'Ghim: quân đen không dám chạy vì sau lưng là Vua. Xiên: chiếu Vua, Vua chạy thì ăn quân phía sau!', emoji: '📌 🍢' },
          { type: 'puzzle', say: 'Xiên! Xe chiếu Vua, rồi ăn Hậu phía sau.', fen: '3q4/8/3k4/8/8/8/7K/7R w - - 0 1', goal: 'solution', solution: ['Rd1+', 'Ke6', 'Rxd8'] },
          { type: 'puzzle', say: 'Ghim! Tượng ghim Hậu vào Vua. Tốt a4 bảo vệ Tượng.', fen: '4k3/3q4/8/8/P7/8/8/4KB2 w - - 0 1', goal: 'solution', solution: ['Bb5', 'Qxb5', 'axb5'] },
        ],
      },
    ],
  },
  {
    id: 'w9', title: 'Chiếu hết 2 nước', emoji: '🎯', color: '#f78fb3',
    lessons: [
      {
        id: 'mate2moves', title: 'Nghĩ trước 2 bước', emoji: '🔮',
        steps: [
          { type: 'slide', say: 'Cao thủ luôn nghĩ trước: "Mình đi thế này, bạn đi thế kia, rồi mình chiếu hết!" Con có 2 nước để chiếu hết.', emoji: '🔮' },
          { type: 'puzzle', say: 'Chiếu hết trong 2 nước! Gợi ý: Xe nhốt Vua trước.', fen: '6k1/8/6K1/8/8/8/8/7R w - - 0 1', goal: 'mate', maxMoves: 2 },
          { type: 'puzzle', say: 'Hai Xe làm cầu thang. Chiếu hết trong 2 nước!', fen: '6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1', goal: 'mate', maxMoves: 2 },
          { type: 'puzzle', say: 'Hậu và Vua cùng nhau. Chiếu hết trong 2 nước!', fen: 'k7/8/8/2K5/8/8/8/1Q6 w - - 0 1', goal: 'mate', maxMoves: 2 },
        ],
      },
    ],
  },
  {
    id: 'w10', title: 'Tàn cuộc', emoji: '🏁', color: '#9ad0ec',
    lessons: [
      {
        id: 'race', title: 'Tốt chạy về đích', emoji: '🏃',
        steps: [
          { type: 'slide', say: 'Khi bàn cờ còn ít quân, Tốt rất quý vì có thể thành Hậu. Hãy đưa Tốt về đích!', emoji: '🏁' },
          { type: 'play', say: 'Đưa Tốt về đích, phong Hậu!', fen: '7k/8/8/8/8/8/P7/K7 w - - 0 1', goal: 'promote', bot: 2 },
        ],
      },
      {
        id: 'tworooks', title: 'Hai Xe chiếu hết', emoji: '🪜',
        steps: [
          { type: 'slide', say: 'Hai Xe thay nhau đẩy Vua đen ra mép bàn cờ, như leo cầu thang!', board: { fen: '6k1/R7/1R6/8/8/8/8/6K1 b - - 0 1' } },
          { type: 'play', say: 'Chiếu hết Vua đen bằng hai Xe!', fen: '8/8/8/4k3/8/8/8/R3K2R w - - 0 1', goal: 'mate', bot: 2 },
        ],
      },
      {
        id: 'queenmate', title: 'Hậu chiếu hết', emoji: '👸',
        steps: [
          { type: 'slide', say: 'Hậu nhốt Vua đen vào góc, rồi Vua trắng đi đến giúp. Nhớ: luôn chừa cho Vua đen một ô, kẻo HÒA!', emoji: '👸🤴' },
          { type: 'play', say: 'Chiếu hết bằng Hậu và Vua!', fen: '8/8/8/4k3/8/8/8/3QK3 w - - 0 1', goal: 'mate', bot: 2 },
        ],
      },
      {
        id: 'rookmate', title: 'Xe chiếu hết', emoji: '🏰',
        steps: [
          { type: 'slide', say: 'Bài khó nhất! Xe chặn đường, Vua trắng tiến lên đối mặt Vua đen. Kiên nhẫn nhé!', emoji: '🏰🤴' },
          { type: 'play', say: 'Chiếu hết bằng Xe và Vua!', fen: '8/8/8/4k3/8/8/8/R3K3 w - - 0 1', goal: 'mate', bot: 2 },
        ],
      },
    ],
  },
  {
    id: 'w11', title: 'Đấu trường', emoji: '🥊', color: '#ff6b6b',
    lessons: [
      { id: 'bot0', title: 'Đấu Gà Con', emoji: '🐣', steps: [{ type: 'play', say: 'Đánh với Gà Con! Chiếu hết để thắng.', fen: START, goal: 'mate', bot: 0 }] },
      { id: 'bot1', title: 'Đấu Thỏ Trắng', emoji: '🐰', steps: [{ type: 'play', say: 'Thỏ Trắng thích ăn quân. Cẩn thận nhé!', fen: START, goal: 'mate', bot: 1 }] },
      { id: 'bot2', title: 'Đấu Cáo Tinh', emoji: '🦊', steps: [{ type: 'play', say: 'Cáo Tinh nghĩ trước 2 bước!', fen: START, goal: 'mate', bot: 2 }] },
      { id: 'bot3', title: 'Đấu Sói Xám', emoji: '🐺', steps: [{ type: 'play', say: 'Sói Xám rất mạnh. Nhớ 3 bí kíp mở màn!', fen: START, goal: 'mate', bot: 3 }] },
      { id: 'bot4', title: 'Đấu Rồng Lửa', emoji: '🐉', steps: [{ type: 'play', say: 'Trùm cuối Rồng Lửa! Con là chuyên gia rồi!', fen: START, goal: 'mate', bot: 4 }] },
    ],
  },
];

export const BOTS = [
  { name: 'Gà Con', emoji: '🐣' },
  { name: 'Thỏ Trắng', emoji: '🐰' },
  { name: 'Cáo Tinh', emoji: '🦊' },
  { name: 'Sói Xám', emoji: '🐺' },
  { name: 'Rồng Lửa', emoji: '🐉' },
];

export function allLessons() {
  return WORLDS.flatMap((w) => w.lessons.map((l) => ({ ...l, world: w })));
}

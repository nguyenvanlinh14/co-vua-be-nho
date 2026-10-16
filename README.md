# ♞ Cờ Vua Bé Nhỏ

Web học cờ vua cho bé ~6 tuổi (thiết kế thân thiện với trẻ ADHD mức nhẹ): đi từ lúc **chưa biết gì** đến **đánh thắng máy**.

👉 **Vào học:** https://nguyenvanlinh14.github.io/co-vua-be-nho/

## Thiết kế cho bé tập trung ngắn

- **Bài siêu ngắn**: mỗi bài 3–6 bước, 2–4 phút.
- **Một việc mỗi màn hình**: chỉ một câu hướng dẫn, nút to, chấm xanh chỉ ô đi được.
- **Phản hồi tức thì**: âm thanh, pháo giấy, sao thưởng; sai thì động viên nhẹ và cho thử lại ngay.
- **Giọng đọc tiếng Việt** (Cú Mèo đọc hướng dẫn, bé chưa cần đọc giỏi) – bật/tắt bằng nút 🔊.
- **Nhắc nghỉ** sau ~12 phút: uống nước, vươn vai.
- **Gợi ý 2 nấc**: sáng quân cần đi → sáng cả ô đích.
- Luôn được ít nhất 1 sao, làm lại để lên 3 sao.

## Lộ trình (11 thế giới)

| # | Thế giới | Bé học được |
|---|----------|-------------|
| 1 | 🏰 Bàn cờ thần kỳ | Bàn cờ, tên ô |
| 2 | ♟️ Gặp gỡ các quân cờ | Xe, Tượng, Hậu, Vua, Mã, Tốt (trò ăn sao ⭐), giá trị quân |
| 3 | 🍪 Ăn quân | Ăn quân không được bảo vệ, tránh bẫy |
| 4 | ⚔️ Chiếu tướng | Chiếu, 3 cách thoát chiếu |
| 5 | 🏆 Chiếu hết | 8 thế chiếu hết 1 nước |
| 6 | ✨ Nước đi đặc biệt | Nhập thành, phong cấp, bắt tốt qua đường |
| 7 | 🌅 Khai cuộc | 3 bí kíp mở màn |
| 8 | 🧠 Chiến thuật | Chĩa đôi, ghim, xiên |
| 9 | 🎯 Chiếu hết 2 nước | Tính trước 2 bước |
| 10 | 🏁 Tàn cuộc | Tốt về đích, chiếu hết bằng 2 Xe / Hậu / Xe |
| 11 | 🥊 Đấu trường | 5 máy: Gà Con 🐣 → Thỏ 🐰 → Cáo 🦊 → Sói 🐺 → Rồng 🐉 |

Thế giới sau mở khi xong một nửa thế giới trước. Bố mẹ muốn mở hết: thêm `?all` vào cuối link.

**Sau khi xong hết:** luyện tiếp miễn phí ở [lichess.org/learn](https://lichess.org/learn) và [lichess.org/training](https://lichess.org/training), mỗi ngày 10–15 phút.

## Kỹ thuật

- Web tĩnh thuần HTML/CSS/JS (không cần build), chạy trên GitHub Pages miễn phí.
- Luật cờ: [chess.js](https://github.com/jhlywa/chess.js) (BSD-2, kèm trong `vendor/`).
- Máy đánh: negamax + alpha-beta có giới hạn thời gian (`js/engine.js`).
- Tiến độ lưu trong trình duyệt (localStorage) của máy bé dùng.
- Kiểm chứng toàn bộ bài tập (nước hợp lệ, chiếu hết thật, bài sao giải được): `node tools/verify.mjs`
- Chạy thử trên máy: `python3 -m http.server 8000` rồi mở http://localhost:8000

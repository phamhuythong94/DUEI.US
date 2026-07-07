# JACKPOT WIRE — Hướng dẫn setup

## 1. Tạo project Supabase
1. Vào https://supabase.com → **Start your project** → đăng ký/đăng nhập (dùng GitHub cho nhanh).
2. **New project** → đặt tên tuỳ ý → chọn 1 mật khẩu database mạnh (lưu lại, không phải mật khẩu admin trang web) → chọn region gần mày nhất → **Create new project** (đợi ~2 phút khởi tạo).

## 2. Chạy schema (tạo bảng)
1. Trong project vừa tạo, vào menu trái → **SQL Editor** → **New query**.
2. Mở file `schema.sql` trong bộ này, copy toàn bộ nội dung, dán vào ô query.
3. Bấm **Run**. Nếu thấy "Success", bảng đã tạo xong (`wins`, `leaderboard_entries`, `leaderboard_meta`).

## 3. Tạo tài khoản admin (đăng nhập trang /admin.html)
1. Menu trái → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Nhập email + mật khẩu mày muốn dùng để đăng nhập trang admin. Tick **Auto Confirm User**.
3. Đây chính là email/password mày sẽ gõ ở trang `admin.html`.

## 4. Lấy URL + anon key
1. Menu trái → **Project Settings** (biểu tượng bánh răng) → **API**.
2. Copy **Project URL** và **anon public** key.
3. Mở file `config.js`, thay vào 2 dòng:
   ```js
   const SUPABASE_URL = "https://xxxx.supabase.co";
   const SUPABASE_ANON_KEY = "eyJhbGciOi....";
   ```
4. Cũng trong `config.js`, sửa `REGISTER_URL` thành link đăng ký thật của mày (referral link) — dùng link thật, không dùng domain giả mạo nhà cung cấp game.

## 5. Đẩy lên GitHub Pages
1. Tạo repo mới trên GitHub, upload toàn bộ các file: `index.html`, `admin.html`, `style.css`, `public.js`, `admin.js`, `config.js`.
2. Repo → **Settings** → **Pages** → chọn branch `main`, thư mục `/root` → **Save**.
3. Sau vài phút, GitHub cho link dạng `https://ten-user.github.io/ten-repo/`.
4. `admin.html` sẽ nằm ở `.../admin.html` — chỉ mày biết link này, không có gì liên kết tới nó công khai để tránh người lạ tò mò vào.

## 6. Dùng hằng ngày
- Vào `admin.html` → đăng nhập bằng email/password đã tạo ở bước 3.
- **Post a new win**: nhập username, game, wager, multiplier, payout, (tuỳ chọn) link ảnh screenshot → **Post win**. Trang chính (`index.html`) tự cập nhật ngay.
- **Leaderboard settings**: nhập prize pool + thời gian kết thúc (đồng hồ đếm ngược tự chạy).
- **Add/update leaderboard row**: nhập place (1,2,3...), player, points, prize → **Save row**. Nếu nhập lại đúng place cũ, số liệu sẽ tự ghi đè (cập nhật) thay vì tạo dòng mới — hợp với việc mày chụp ảnh bảng xếp hạng bên site khác rồi gõ lại số liệu mỗi ngày.
- Xoá dòng nào thì bấm **Delete** cạnh dòng đó trong danh sách bên dưới mỗi panel.

## Lưu ý
- anon key trong `config.js` an toàn để lộ công khai — nó chỉ có quyền mà RLS (trong `schema.sql`) cho phép: ai cũng đọc được `wins`/`leaderboard`, nhưng chỉ tài khoản đã đăng nhập (mày) mới ghi/sửa/xoá được.
- Trang có sẵn dòng "18+ · gamble responsibly" ở footer — nên giữ lại, nhiều nơi yêu cầu ghi rõ điều này khi quảng cáo liên quan cờ bạc.

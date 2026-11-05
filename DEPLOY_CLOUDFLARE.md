# Deploy lên Cloudflare Pages

Hướng dẫn này dùng cho phiên bản Vite + React SPA của dự án. Sau khi deploy, các route như `/projects`, `/about`, `/cv-mn` vẫn hoạt động khi refresh nhờ file `public/_redirects`.

## 1. Chuẩn bị trong repo

Các file sau đã được thêm sẵn:

| File | Mục đích |
| --- | --- |
| `public/_redirects` | SPA fallback: mọi route đều trả về `index.html` |
| `public/_headers` | Security headers + cache cho asset/PWA |
| `public/robots.txt` | Chặn index trang admin `/cv-mn` |
| `.nvmrc` | Node 22 cho build |
| `wrangler.toml` | Cấu hình deploy bằng Wrangler CLI |
| `dist/` | Thư mục output của `npm run build` |

Build command: `npm run build`  
Build output directory: `dist`  
Root directory: để trống (hoặc `/`)

## 2. Deploy bằng dashboard (khuyến nghị)

1. Push code lên GitHub/GitLab:

   ```bash
   # Tạo repo trống trên GitHub trước (đừng tick "Add README"), rồi:
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
2. Vào [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Chọn repository, branch `main`.
4. Điền:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: `22` (nếu có ô này)
5. Mở **Environment variables** và thêm cho cả **Production** và **Preview**:

   ```
   VITE_SUPABASE_URL=https://tzhqrpyxpnbucsvxpiwd.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   > Code chấp nhận cả tên mới `VITE_SUPABASE_PUBLISHABLE_KEY` và tên cũ
   > `VITE_SUPABASE_ANON_KEY` (dùng cái nào cũng được, tên mới được ưu tiên).
   > Biến `VITE_*` phải có mặt **trước khi build**, vì Vite nhúng chúng vào bundle.
   > Nếu thiếu, trang public vẫn chạy nhưng nút tải CV và trang admin sẽ không hoạt động.

6. Bấm **Save and Deploy**. Lần build đầu mất khoảng 1–3 phút.
7. Cloudflare cấp URL dạng `https://<project-name>.pages.dev`.

## 3. Deploy bằng Wrangler CLI (tuỳ chọn)

```bash
npm ci
npm run build
npx wrangler pages deploy dist --project-name=info-vibe-web
```

Nếu tên project khác, sửa `name` trong `wrangler.toml` hoặc truyền `--project-name`.

Lưu ý: cách này chỉ upload thư mục `dist`. Biến môi trường vẫn phải được khai báo trong Cloudflare Pages (hoặc truyền vào lúc build).

## 4. Cấu hình domain riêng

1. Trong Pages project → **Custom domains** → **Set up a custom domain**.
2. Nhập domain, ví dụ `portfolio.example.com`.
3. Nếu domain đang dùng Cloudflare DNS, bản ghi CNAME sẽ được tạo tự động.
4. Chờ trạng thái **Active** (thường dưới 5 phút).

Sau khi có domain thật, cập nhật các URL placeholder trong `index.html`:

- `og:url`
- `og:image`
- `twitter:url`
- `twitter:image`

Dùng URL tuyệt đối, ví dụ `https://portfolio.example.com/logo.png`.

## 5. Cấu hình Supabase cho domain mới

Trong Supabase Dashboard → **Authentication** → **URL Configuration**:

- **Site URL**: `https://<domain-cua-ban>/`
- **Redirect URLs**: thêm
  - `https://<domain-cua-ban>/cv-mn`
  - `https://<project-name>.pages.dev/cv-mn`
  - `http://localhost:5173/cv-mn` (để test local)
  - các URL preview `https://<hash>.<project-name>.pages.dev/cv-mn` nếu cần

Nếu không thêm, magic link đăng nhập admin sẽ redirect về sai domain.

## 6. Kiểm tra sau deploy

1. Mở trang chủ, kiểm tra ảnh/avatar, CV, dark mode, đổi ngôn ngữ.
2. Mở `/projects` rồi **refresh** → phải vẫn ở trang Projects, không bị 404.
3. Mở `/cv-mn` → gửi magic link → đăng nhập → upload/thử CV.
4. Kiểm tra Console không có lỗi CSP.
5. Kiểm tra PWA: DevTools → Application → Manifest (phải có icon 192 và 512).

## 7. Bảo mật Supabase (quan trọng)

**Project Supabase mới:** chạy [`supabase/setup-cv.sql`](./supabase/setup-cv.sql) một lần trong SQL Editor. File này tạo bucket `cvs`, bảng `cv_entries`, bật RLS và policy chỉ admin được ghi — an toàn khi chạy lại nhiều lần.

Nếu trước đây bạn đã chạy SQL cũ trong `SUPABASE_SETUP.md`, database có thể đang cho phép **anonymous user** insert/update/delete. Hãy chạy file [`supabase/secure-cv.sql`](./supabase/secure-cv.sql) trong SQL Editor để thay bằng policy chỉ admin.

Sau đó kiểm tra:

- Bảng `cv_entries` có biểu tượng khoá (RLS đang bật).
- Storage bucket `cvs` chỉ cho user đã đăng nhập đúng email upload/update/delete.
- Người lạ vẫn xem được CV mặc định.

## 8. Lưu ý

- **Không commit `.env`** (đã có trong `.gitignore`).
- `VITE_SUPABASE_PUBLISHABLE_KEY` (hoặc `VITE_SUPABASE_ANON_KEY`) là khoá public, được nhúng vào frontend. An toàn **chỉ khi** RLS được cấu hình đúng.
- Nếu thêm dịch vụ ngoài mới (analytics, API...), cập nhật `connect-src`/`img-src` trong `public/_headers`, nếu không trình duyệt sẽ chặn.
- Service Worker của PWA có thể giữ bản cũ vài giây sau khi deploy. Mở DevTools → Application → Service Workers → **Update** nếu cần.
- Cloudflare Pages miễn phí có giới hạn build/tháng; với portfolio cá nhân thì quá đủ.

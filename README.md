# Nail Gallery · Frankfurt

Static website cho Nail Gallery Frankfurt — HTML/CSS/JS thuần, không build step.

**Live:** https://nailgalleryfrankfurt.de/

## Cấu trúc

| Đường dẫn | Mô tả |
|---|---|
| `index.html` | Trang chính (one-page: hero, philosophy, gallery, services, contact) |
| `impressum.html` | Impressum (bắt buộc theo luật Đức) |
| `datenschutz.html` | Datenschutzerklärung (GDPR) |
| `assets/` | Ảnh và video nền |
| `Dockerfile`, `nginx.conf` | Chạy container (dùng cho Cloud Run), không dùng khi deploy shared hosting |

## Deploy

Hosting hiện tại là Hostinger shared hosting, upload qua FTP vào `public_html`.
Không upload `Dockerfile`, `nginx.conf`, `.dockerignore`, `.gcloudignore` — shared hosting không dùng tới.

```bash
FTP_HOST=<ip> FTP_USER=<user> FTP_PASS=<pass> bash deploy.sh
```

Lưu ý: Hostinger CDN (`hcdn`) tự nén lại ảnh khi phục vụ, nên kích thước file
tải về qua HTTP sẽ nhỏ hơn file gốc trong `assets/` — đây là hành vi bình thường,
không phải upload lỗi.

## Chạy local

```bash
python -m http.server 8000
```

Hoặc mở thẳng `index.html` bằng trình duyệt.

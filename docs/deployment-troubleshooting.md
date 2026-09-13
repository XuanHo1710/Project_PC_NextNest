# Xử lý lỗi kéo image khi triển khai

Workflow `.github/workflows/workflow-deploy.yml` build/push frontend từ
`client/`, các NestJS service từ `microservices/Dockerfile.service`, và AI
từ `microservices/apps/ai-service/Dockerfile`. Job deploy chờ cả `docker`
và `docker-ai`, rồi dùng `docker-compose.yml` ở thư mục gốc.
`microservices/docker-compose.yml` chỉ phục vụ hạ tầng phát triển.

## DEPLOY-001 — History Log không khớp tên image

- Khu vực: CI/CD. Mức độ: P1. Độ tin cậy: cao.
- Bằng chứng: `docker-compose.yml`, service `history-log`, từng dùng
  `project-chat-social-history_log:latest`; workflow, bước `Build & Push History Log`,
  dùng `project-chat-social-history-log:latest`.
- Hành vi/tác động: Docker tìm sai repository; bước pull trả `not found`
  và các lượt tải đang chạy bị gián đoạn, chặn triển khai.
- Nguyên nhân: Compose dùng `_` trong tên image thay vì `-`.
- Đã sửa: đồng bộ image trong Compose với tag workflow đang publish.
- Kiểm chứng: test `microservices/scripts/deployment-images.test.cjs`
  đối chiếu toàn bộ 13 image ứng dụng với các tag `latest` được push.
  Test tái hiện lỗi trước khi sửa và được chạy trong job `quality`.
- Tương thích: giữ nguyên tên service, hostname và API; không có migration.

Chạy kiểm tra từ thư mục gốc, không cần registry hay thông tin đăng nhập:

```sh
node --test microservices/scripts/deployment-images.test.cjs
```

Nếu sandbox Windows không cho test runner tạo subprocess (`spawn EPERM`),
chạy cùng test trực tiếp: `node microservices/scripts/deployment-images.test.cjs`.

Sau khi bản sửa có trên nhánh triển khai, chạy workflow trên commit mới.
Re-run job của commit cũ vẫn checkout Compose cũ. Việc chạy workflow sẽ
push image và triển khai nên người vận hành cần chủ động thực hiện.
Nếu tên đúng vẫn trả `not found`, kiểm tra bước `Build & Push History Log`
đã thành công và tag tồn tại trong đúng Docker Hub repository; sau đó kiểm
tra quyền của tài khoản mà bước `Login Docker Hub` đang sử dụng.
Không in token hoặc nội dung `.env` ra log.

Theo [Docker Compose pull](https://docs.docker.com/reference/cli/docker/compose/pull/),
lệnh pull tải image được khai báo trong Compose. Không bỏ qua lỗi bằng
`--ignore-pull-failures`: cách đó không khắc phục tên image sai.

Phạm vi kiểm chứng cục bộ: hợp đồng tên image và cấu hình Compose.
Chưa kiểm chứng tag trên registry hoặc deploy thực tế; không cần chạy
build/type-check ứng dụng cho thay đổi tên image này.

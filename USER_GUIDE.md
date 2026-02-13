# Tài liệu hướng dẫn sử dụng — Arisu Store

> **Phiên bản:** 1.0  
> **Ngày cập nhật:** 2026-02-06

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Hướng dẫn cho Khách hàng (Buyer)](#2-hướng-dẫn-cho-khách-hàng-buyer)
3. [Hướng dẫn cho Người bán (Seller)](#3-hướng-dẫn-cho-người-bán-seller)
4. [Hướng dẫn cho Quản trị viên (Admin)](#4-hướng-dẫn-cho-quản-trị-viên-admin)
5. [Quy trình xử lý đơn hàng](#5-quy-trình-xử-lý-đơn-hàng)
6. [Câu hỏi thường gặp (FAQ)](#6-câu-hỏi-thường-gặp-faq)

---

## 1. Giới thiệu

**Arisu Store** là nền tảng thương mại điện tử chuyên cung cấp PC Gaming, Laptop, và Linh kiện máy tính chính hãng. Hệ thống hỗ trợ 3 vai trò người dùng:

| Vai trò                   | Mô tả                                | Truy cập                                       |
| ------------------------- | ------------------------------------ | ---------------------------------------------- |
| **Khách hàng (Buyer)**    | Duyệt sản phẩm, đặt hàng, thanh toán | Trang chủ `/`                                  |
| **Người bán (Seller)**    | Đăng sản phẩm, quản lý đơn hàng      | `/create-product`, `/create-product/my-orders` |
| **Quản trị viên (Admin)** | Quản lý toàn bộ hệ thống             | `/admin/dashboard`                             |

### Phương thức thanh toán hỗ trợ

- **COD (Cash on Delivery):** Thanh toán khi nhận hàng.
- **CARD (Online):** Thanh toán trực tuyến qua PayOS (hỗ trợ QR Code, chuyển khoản ngân hàng).

---

## 2. Hướng dẫn cho Khách hàng (Buyer)

### 2.1 Đăng ký & Đăng nhập

1. Truy cập trang chủ, nhấn **"Đăng ký"** ở góc trên bên phải.
2. Điền thông tin: Email, Mật khẩu, Họ tên.
3. Xác thực OTP qua email.
4. Sau khi xác thực, tài khoản sẽ được kích hoạt.

**Quên mật khẩu:**

1. Nhấn "Quên mật khẩu" tại trang đăng nhập.
2. Nhập email đã đăng ký.
3. Nhận OTP qua email → Xác thực → Đặt mật khẩu mới.

### 2.2 Duyệt sản phẩm

- **Trang chủ:** Hiển thị sản phẩm đề xuất, sản phẩm giảm giá, danh mục nổi bật.
- **Danh mục (Collection):** Nhấn vào danh mục cha (ví dụ: "Laptop") → hiển thị tất cả sản phẩm thuộc danh mục con.
  - Nhấn vào danh mục con (ví dụ: "Laptop ACER") → chỉ hiển thị sản phẩm của danh mục đó.
- **Bộ lọc:** Lọc theo CPU, RAM, Dung lượng ổ cứng, Giá, Sắp xếp theo tên/giá/mới nhất.
- **Tìm kiếm:** Thanh tìm kiếm ở Header hỗ trợ tìm theo tên sản phẩm.

### 2.3 Chi tiết sản phẩm

- Xem ảnh sản phẩm, mô tả, thông số kỹ thuật.
- Chọn **biến thể** (variant): Màu sắc, Cấu hình, RAM, v.v.
- Xem giá gốc, giá sau giảm, % giảm giá.
- Nhấn **"Thêm vào giỏ hàng"** hoặc **"Mua ngay"**.

### 2.4 Giỏ hàng & Thanh toán

1. Nhấn icon giỏ hàng ở Header để xem giỏ hàng.
2. Điều chỉnh số lượng, xóa sản phẩm nếu cần.
3. Nhấn **"Thanh toán"** → Điền thông tin giao hàng.
4. Chọn phương thức thanh toán:
   - **COD:** Xác nhận đơn → Đơn hàng được tạo ngay.
   - **CARD:** Quét QR Code hoặc chuyển khoản → Đơn hàng chuyển sang COMPLETED khi thanh toán thành công.
5. Nếu thanh toán online chưa hoàn tất trong 15 phút → Đơn hàng **EXPIRED**.

### 2.5 Quản lý đơn hàng

Truy cập **Hồ sơ → Quản lý đơn hàng** (`/profile/order`).

| Trạng thái                                 | Ý nghĩa                           | Hành động khách hàng         |
| ------------------------------------------ | --------------------------------- | ---------------------------- |
| **Chờ xác nhận (PENDING)**                 | Chờ thanh toán / Seller xác nhận  | Có thể hủy đơn COD           |
| **Chờ giao hàng (COMPLETED)**              | Seller đã xác nhận, chuẩn bị giao | —                            |
| **Đang vận chuyển (SHIPPING)**             | Đang trên đường giao              | Nhấn "Đã nhận hàng" khi nhận |
| **Đã giao hàng (DELIVERED)**               | Khách đã xác nhận nhận hàng       | —                            |
| **Đã hủy (CANCELLED)**                     | Đơn hàng bị hủy                   | —                            |
| **Hoàn tiền (REFUNDED)**                   | Đã hoàn tiền                      | —                            |
| **Hết hạn (EXPIRED)**                      | Hết thời gian thanh toán online   | Không thể thanh toán lại     |
| **Đang xử lý từ chối (PENDING_REJECTION)** | Seller từ chối, chờ admin duyệt   | —                            |

### 2.6 Chat với Người bán

- Nhấn nút **"Chat"** ở trang đơn hàng để nhắn tin trực tiếp với người bán.
- Hoặc truy cập `/chat` để xem danh sách hội thoại.

---

## 3. Hướng dẫn cho Người bán (Seller)

### 3.1 Đăng sản phẩm

1. Truy cập **"Đăng sản phẩm"** (`/create-product`).
2. Điền thông tin:
   - Tên sản phẩm, Mô tả, Danh mục, Thương hiệu.
   - Thuộc tính sản phẩm (CPU, RAM, Dung lượng...).
   - **Biến thể (Variants):** Mỗi biến thể có SKU, Giá, Giảm giá (%), Tồn kho, Ảnh sản phẩm.
3. Chọn biến thể mặc định (hiển thị ở danh sách sản phẩm).
4. Nhấn **"Tạo sản phẩm"**.

### 3.2 Quản lý sản phẩm

- Xem danh sách sản phẩm đã đăng tại `/create-product/list`.
- Chỉnh sửa, Ngừng bán, Xóa sản phẩm.
- Cập nhật tồn kho, giá, ảnh.

### 3.3 Quản lý đơn hàng (Seller)

Truy cập `/create-product/my-orders` để xem đơn hàng chứa sản phẩm của mình.

| Trạng thái                              | Hành động Seller                                                              |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| **Chờ giao hàng (COMPLETED)**           | Nhấn **"Giao hàng"** → Chuyển sang SHIPPING. Hoặc **"Từ chối"** → Nhập lý do. |
| **Đã giao hàng (DELIVERED)**            | Nhấn **"Hoàn tiền"** nếu cần xử lý trả hàng.                                  |
| **Chờ admin duyệt (PENDING_REJECTION)** | Chờ admin xét duyệt yêu cầu từ chối.                                          |

**Lưu ý quan trọng về từ chối đơn hàng:**

- **Đơn COD:** Seller có thể từ chối trực tiếp → đơn hàng chuyển sang CANCELLED.
- **Đơn thanh toán online (CARD):** Seller từ chối → đơn chuyển sang **PENDING_REJECTION** → Admin duyệt → Quyết định hoàn tiền hoặc không.

### 3.4 Chat với Khách hàng

- Nhấn nút **"Chat"** ở trang đơn hàng để liên hệ khách hàng.
- Hỗ trợ giải đáp thắc mắc, trao đổi về đơn hàng.

---

## 4. Hướng dẫn cho Quản trị viên (Admin)

### 4.1 Dashboard

Truy cập `/admin/dashboard` để xem tổng quan:

- **Thống kê:** Tổng đơn hàng, Doanh thu, Đơn đã thanh toán.
- **Biểu đồ:** Doanh thu tuần, Đơn hàng theo ngày, Doanh thu theo tháng.
- **Đơn hàng mới nhất:** 10 đơn gần đây.

### 4.2 Quản lý đơn hàng

Truy cập `/admin/order`:

- Xem tất cả đơn hàng, lọc theo trạng thái + loại thanh toán.
- **Xác nhận COD:** Khi khách đã nhận hàng COD, nhấn "Nhận tiền" để ghi nhận thanh toán.
- **Xử lý yêu cầu từ chối:**
  - Đơn có trạng thái **"Chờ duyệt từ chối"** (PENDING_REJECTION) sẽ hiển thị badge cảnh báo.
  - Nhấn **"Duyệt"** → Chọn hoàn tiền hoặc không.
  - Nhấn **"Từ chối"** → Đơn trở lại COMPLETED, seller phải tiếp tục giao hàng.
- **Xem chi tiết:** Nhấn icon mắt để xem toàn bộ thông tin đơn hàng.

### 4.3 Quản lý sản phẩm

Truy cập `/admin/products`:

- Xem, Sửa, Xóa sản phẩm.
- Cập nhật trạng thái: ACTIVE, INACTIVE, STOPSOLD.
- Quản lý danh mục, thương hiệu.

### 4.4 Quản lý tài khoản

- **Nhân viên** (`/admin/account-employee`): Tạo, sửa, phân quyền tài khoản nhân viên.
- **Khách hàng** (`/admin/account-guest`): Xem, quản lý tài khoản khách hàng.
- **Vai trò & Quyền** (`/admin/role`, `/admin/permission`): Định nghĩa vai trò và gán quyền hạn.

### 4.5 Quản lý danh mục & Thương hiệu

- **Danh mục** (`/admin/category`): Tạo danh mục cha/con, quản lý cấu trúc phân cấp.
- **Thương hiệu** (`/admin/brand`): Tạo, cập nhật thương hiệu với logo và mô tả.

### 4.6 Cài đặt hệ thống

Truy cập `/admin/settings`:

| Tab            | Chức năng                                          |
| -------------- | -------------------------------------------------- |
| **Chung**      | Tên website, Email liên hệ, SĐT, Địa chỉ, Logo     |
| **Giao diện**  | Dark Mode, Màu chủ đạo, Sidebar, Số dòng/trang     |
| **Thông báo**  | Bật/tắt thông báo đơn hàng, tồn kho, đánh giá      |
| **Email SMTP** | Cấu hình SMTP để gửi email tự động                 |
| **Bảo mật**    | 2FA, Tự động đăng xuất, Giới hạn IP, Log hoạt động |

### 4.7 Lịch sử hoạt động

Truy cập `/admin/profile` → Xem log các thao tác đã thực hiện trên hệ thống.

---

## 5. Quy trình xử lý đơn hàng

### 5.1 Luồng đơn hàng COD

```
Khách đặt hàng (COD)
  → PENDING (Chờ xác nhận)
  → COMPLETED (Seller xác nhận, đợi giao hàng)
  → SHIPPING (Đang vận chuyển)
  → DELIVERED (Khách xác nhận nhận hàng + Tự động tạo Payment PAID)
```

### 5.2 Luồng đơn hàng Online (CARD)

```
Khách đặt hàng (CARD)
  → PENDING (Chờ thanh toán)
  → Thanh toán qua PayOS (QR Code / Chuyển khoản)
  → COMPLETED (Thanh toán thành công)
  → SHIPPING (Seller giao hàng)
  → DELIVERED (Khách xác nhận nhận hàng)
```

### 5.3 Luồng từ chối đơn hàng

**Đơn COD:**

```
COMPLETED → Seller từ chối (nhập lý do) → CANCELLED
```

**Đơn Online:**

```
COMPLETED → Seller từ chối (nhập lý do)
  → PENDING_REJECTION (Chờ admin duyệt)
  → Admin duyệt + hoàn tiền → REFUNDED
  → Admin duyệt không hoàn tiền → CANCELLED
  → Admin từ chối yêu cầu → COMPLETED (tiếp tục giao)
```

### 5.4 Luồng hoàn tiền

```
DELIVERED → Seller yêu cầu hoàn tiền → REFUNDED
  (Payment được đánh dấu REFUND, isCheckout = false)
```

---

## 6. Câu hỏi thường gặp (FAQ)

### Q: Tôi có thể hủy đơn hàng online sau khi thanh toán không?

**A:** Không. Khách hàng không thể tự hủy đơn sau khi đã thanh toán. Chỉ Seller có quyền từ chối, và cần Admin duyệt mới có thể hủy/hoàn tiền.

### Q: Nếu đơn hàng online hết hạn thanh toán thì sao?

**A:** Đơn hàng sẽ tự động chuyển sang trạng thái EXPIRED sau 15 phút. Tồn kho sẽ được hoàn lại.

### Q: Làm sao biết đơn hàng COD đã được thanh toán?

**A:** Admin xác nhận bằng cách nhấn "Nhận tiền" ở trang quản lý đơn hàng. Hệ thống sẽ tự động tạo bản ghi thanh toán.

### Q: Tôi muốn đổi vai trò tài khoản?

**A:** Liên hệ Admin để được cấp quyền. Admin có thể thay đổi vai trò tại trang quản lý tài khoản nhân viên.

### Q: Sản phẩm của tôi không hiển thị trên trang chủ?

**A:** Kiểm tra trạng thái sản phẩm phải là **ACTIVE**. Sản phẩm INACTIVE hoặc STOPSOLD sẽ không hiển thị.

### Q: Cách liên hệ hỗ trợ?

**A:** Sử dụng tính năng Chat trên website hoặc gửi email đến địa chỉ liên hệ hiển thị ở footer trang web.

---

_Tài liệu này được tạo tự động và cập nhật theo phiên bản hệ thống. Mọi thắc mắc vui lòng liên hệ đội ngũ phát triển._

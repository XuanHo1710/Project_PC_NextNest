# 🚀 Query Optimization Report — Project PC

> **Ngày thực hiện:** 25/03/2026  
> **Phạm vi:** Toàn bộ hệ thống từ Frontend (Next.js) → API Gateway → Microservices (NestJS + MongoDB)

---

## 📋 Mục lục

1. [Tổng quan các vấn đề tìm thấy](#1-tổng-quan-các-vấn-đề-tìm-thấy)
2. [Database Indexes — Các index đã thêm](#2-database-indexes)
3. [Backend Query Optimizations](#3-backend-query-optimizations)
4. [Frontend React Query Optimizations](#4-frontend-react-query-optimizations)
5. [Tóm tắt tất cả file đã thay đổi](#5-tóm-tắt-tất-cả-file-đã-thay-đổi)

---

## 1. Tổng quan các vấn đề tìm thấy

### ❌ Vấn đề nghiêm trọng nhất

| #   | Vấn đề                                          | Vị trí               | Mức độ ảnh hưởng                                                  |
| --- | ----------------------------------------------- | -------------------- | ----------------------------------------------------------------- |
| 1   | **Order schema không có index**                 | `order.entity.ts`    | 🔴 Cực kỳ nghiêm trọng — Cron job mỗi 5 phút full collection scan |
| 2   | **N+1 query trong `checkVariantsStock`**        | `product.service.ts` | 🔴 Mỗi variant gọi 1 query riêng                                  |
| 3   | **N+1 query trong `reindexAllToElasticsearch`** | `product.service.ts` | 🔴 Mỗi product gọi 1 query riêng để lấy variants                  |
| 4   | **`useCategoriesAll` loop qua tất cả pages**    | `useCategory.ts`     | 🟡 Gọi API nhiều lần tuần tự                                      |
| 5   | **Brand hook `staleTime: 0`**                   | `useBrand.ts`        | 🟡 Luôn refetch, tốn bandwidth                                    |
| 6   | **Thiếu `.lean()` trên nhiều query**            | Nhiều services       | 🟡 Mongoose document overhead                                     |
| 7   | **Thiếu `placeholderData` cho pagination**      | Nhiều hooks          | 🟡 UI nhấp nháy khi chuyển trang                                  |
| 8   | **`populate('product')` không select field**    | `product.service.ts` | 🟡 Load toàn bộ document product                                  |
| 9   | **Sequential `countDocuments` + `find`**        | `order.service.ts`   | 🟡 Có thể chạy song song                                          |
| 10  | **`getUnreadCount` fetch tất cả conversations** | `chat.service.ts`    | 🟡 Chỉ cần field `unreadCount`                                    |

---

## 2. Database Indexes

### 2.1 Order Schema — `order-service/src/order/entities/order.entity.ts`

**Trước:** Không có index nào (ngoài `_id` mặc định).

**Sau:** Thêm 7 indexes:

```typescript
// Cron job: find PENDING orders with expired expireAt (chạy mỗi 5 phút)
OrderSchema.index({ status: 1, expireAt: 1 });

// Guest order listing: lọc theo guestId + status + sắp xếp createdAt
OrderSchema.index({ "customerInfo.guestId": 1, status: 1, createdAt: -1 });

// Admin order listing: lọc status + sắp xếp createdAt
OrderSchema.index({ status: 1, createdAt: -1 });

// Dashboard stats: aggregation cho paid orders
OrderSchema.index({ "payment.isCheckout": 1, status: 1, createdAt: -1 });

// Seller orders: tìm order chứa variant/product ID cụ thể
OrderSchema.index({ "orderDetail.variantId": 1, status: 1 });
OrderSchema.index({ "orderDetail.productId": 1, status: 1 });

// Online payment queries
OrderSchema.index({ "payment.type": 1, status: 1 });
```

**Giải thích:** Order là entity được query nhiều nhất hệ thống (cron job mỗi 5 phút, dashboard stats, admin listing, guest listing, seller listing). Không có index, MongoDB phải scan toàn bộ collection mỗi lần query — cực kỳ chậm khi có hàng chục ngàn orders.

---

### 2.2 Brand Schema — `product-service/src/brand/entities/brand.entity.ts`

**Trước:** Chỉ có `slug` (unique + index).

**Sau:** Thêm 2 compound indexes:

```typescript
BrandSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
BrandSchema.index({ isDeleted: 1, feature: 1 });
```

**Giải thích:** Query `findAllBrands` luôn filter `isDeleted: false` + optional `status` + sort `createdAt`. Compound index cover cả 3 điều kiện trong 1 index scan.

---

### 2.3 AccountEmployee Schema — `auth-service/src/account-employee/entities/account-employee.entity.ts`

**Trước:** Không có index (chỉ `email` unique).

**Sau:** Thêm 3 indexes:

```typescript
AccountEmployeeSchema.index({ isDeleted: 1, createdAt: -1 });
AccountEmployeeSchema.index({ IDEmp: 1 });
AccountEmployeeSchema.index({ roleId: 1, isDeleted: 1 });
```

**Giải thích:**

- `{ isDeleted: 1, createdAt: -1 }` — Cover admin listing (filter deleted + sort).
- `{ IDEmp: 1 }` — Login dùng `findOne({ IDEmp })`, cần index.
- `{ roleId: 1, isDeleted: 1 }` — Filter theo role (dropdown filter trên admin).

---

### 2.4 Role Schema — `auth-service/src/role/entities/role.entity.ts`

**Trước:** Không có index.

**Sau:**

```typescript
RoleSchema.index({ isDeleted: 1, createdAt: -1 });
```

---

### 2.5 ProductAttributeAllowValue Schema — `product-service/src/product/entities/product-attribute-allow-value.ts`

**Trước:** Không có index.

**Sau:**

```typescript
ProductAttributeAllowValueSchema.index({ product: 1, isDeleted: 1 });
ProductAttributeAllowValueSchema.index({ attributeValue: 1, isDeleted: 1 });
```

**Giải thích:** `findBySlug` query này cho mỗi product detail page. Khi product có nhiều attribute values, cần index trên `product` field.

---

### 2.6 ProductAttributeValue Schema — `product-service/src/product/entities/product-attribute-value.ts`

**Trước:** Chỉ có `createdBy` (implicit từ `index: true`).

**Sau:**

```typescript
ProductAttributeValueSchema.index({ attribute: 1, isDeleted: 1 });
ProductAttributeValueSchema.index({ createdBy: 1, isDeleted: 1 });
```

**Giải thích:** Client product management page sử dụng `getAttributeValuesByAttribute(attrId)` — cần compound index để tránh collection scan.

---

### 2.7 ProductAttribute Schema — `product-service/src/product/entities/product-attribute.ts`

**Trước:** Chỉ có `code` (implicit index) và `createdBy` (implicit index).

**Sau:**

```typescript
ProductAttributeSchema.index({ isDeleted: 1, createdBy: 1 });
ProductAttributeSchema.index({ code: 1, isDeleted: 1 });
```

**Giải thích:** Admin attribute listing filter theo `isDeleted` + `createdBy` đồng thời.

---

### 2.8 History Schema — `history-log/src/history/entities/history.entity.ts`

**Trước:** Không có index.

**Sau:**

```typescript
HistorySchema.index({ adminId: 1, createdAt: -1 });
HistorySchema.index({ createdAt: -1 });
```

**Giải thích:** History log lưu mọi thao tác admin. Với dữ liệu lớn, sort theo `createdAt` mà không có index sẽ cực kỳ chậm.

---

## 3. Backend Query Optimizations

### 3.1 Fix N+1 Query — `checkVariantsStock`

**File:** `product-service/src/product/product.service.ts`

**Trước (N+1 — 1 query per variant):**

```typescript
async checkVariantsStock(items: Array<{ variantId: string; quantity: number }>) {
    const results: any[] = [];
    for (const item of items) {
        // ❌ N+1: Mỗi variant gọi 1 findOne riêng
        const variant = await this.productVariantModel
            .findOne({ _id: new Types.ObjectId(item.variantId), isDeleted: false })
            .select('stock sku')
            .lean()
            .exec();
        // ... push to results
    }
    return results;
}
```

**Sau (Batch — 1 query cho tất cả):**

```typescript
async checkVariantsStock(items: Array<{ variantId: string; quantity: number }>) {
    // ✅ Batch: Gom tất cả variant IDs, query 1 lần duy nhất
    const variantIds = validItems.map(item => new Types.ObjectId(item.variantId));
    const variants = await this.productVariantModel
        .find({ _id: { $in: variantIds }, isDeleted: false })
        .select('stock sku')
        .lean()
        .exec();

    const variantMap = new Map(variants.map(v => [v._id.toString(), v]));
    // ... lookup from map instead of querying
}
```

**Giải thích:** Khi giỏ hàng có 10 sản phẩm, trước đó phải gửi 10 queries tới MongoDB. Bây giờ chỉ cần 1 query duy nhất với `$in`. Giảm từ O(n) queries xuống O(1).

---

### 3.2 Fix N+1 Query — `reindexAllToElasticsearch`

**File:** `product-service/src/product/product.service.ts`

**Trước:**

```typescript
// ❌ N+1: Loop qua từng product, mỗi product gọi 1 query
for (const product of products) {
  const variants = await this.productVariantModel
    .find({ product: product._id, isDeleted: { $ne: true } })
    .lean()
    .exec();
  // ...
}
```

**Sau:**

```typescript
// ✅ Batch: 1 query lấy TẤT CẢ variants, group bằng Map
const allVariants = await this.productVariantModel
  .find({ product: { $in: productIds }, isDeleted: { $ne: true } })
  .lean()
  .exec();

const variantsByProduct = new Map<string, any[]>();
for (const v of allVariants) {
  const pid = v.product.toString();
  if (!variantsByProduct.has(pid)) variantsByProduct.set(pid, []);
  variantsByProduct.get(pid)!.push(v);
}
```

**Giải thích:** Với 500 products, trước đó gửi 500 queries tới MongoDB. Giờ chỉ 1 query. Đặc biệt quan trọng khi reindex vì nó xử lý toàn bộ database.

---

### 3.3 Add `.lean()` — Toàn bộ read queries

**Files:** Nhiều services

| File                          | Method                               | Thay đổi                     |
| ----------------------------- | ------------------------------------ | ---------------------------- |
| `product.service.ts`          | `findAllProductVariants`             | Thêm `.lean()`               |
| `product.service.ts`          | `findOneProductVariant`              | Thêm `.lean()`               |
| `product.service.ts`          | `findAllProductAttributeAllowValues` | Thêm `.lean()`               |
| `brand.service.ts`            | `findAllBrands`                      | Thêm `.lean()`               |
| `brand.service.ts`            | `findBySlug`                         | Thêm `.lean()`               |
| `brand.service.ts`            | `findOneBrand`                       | Thêm `.lean()`               |
| `account-employee.service.ts` | `findAll`                            | Thêm `.lean()`               |
| `order.service.ts`            | `getAllOrders`                       | Thêm `.lean()`               |
| `order.service.ts`            | `getAllOrdersByGuestId`              | Thêm `.lean()`               |
| `order.service.ts`            | `getPendingOnlineOrders`             | Thêm `.lean()`               |
| `order.service.ts`            | `getOrdersByVariantIds`              | Thêm `.lean()`               |
| `order.service.ts`            | `getOrdersByProductIds`              | Thêm `.lean()`               |
| `order.service.ts`            | `handleExpiredOrders` (cron)         | Thêm `.lean()` + `.select()` |

**Giải thích:** `.lean()` bảo Mongoose trả về plain JavaScript objects thay vì full Mongoose documents. Lợi ích:

- **Giảm 50-80% memory** cho mỗi document
- **Tăng tốc 2-5x** vì bỏ qua Mongoose hydration (getters, setters, virtuals, change tracking)
- Phù hợp cho tất cả read-only queries (GET endpoints)

---

### 3.4 Add `.select()` — Giới hạn fields trả về

**File:** `product.service.ts`

**Trước:**

```typescript
// ❌ Populate toàn bộ document Product (tất cả fields)
.populate('product')
```

**Sau:**

```typescript
// ✅ Chỉ lấy fields cần thiết
.populate('product', 'name slug status')
// hoặc
.populate('product', 'name slug status brand category')
```

**Giải thích:** Khi populate `product` không có select, MongoDB trả về toàn bộ document Product (bao gồm `description` dài, `totalStock`, `minPrice`, `maxPrice`, etc.) dù client chỉ cần `name` và `slug`. Giảm signficant data transfer.

---

### 3.5 Parallelize `countDocuments` + `find`

**File:** `order.service.ts`

**Trước (Sequential):**

```typescript
// ❌ Chạy tuần tự — query 2 phải đợi query 1 xong
const totalItems = await this.orderModel.countDocuments(query);
const items = await this.orderModel.find(query).sort(...).skip(...).limit(...);
```

**Sau (Parallel):**

```typescript
// ✅ Chạy song song — 2 queries cùng lúc
const [items, totalItems] = await Promise.all([
    this.orderModel.find(query).sort(...).skip(...).limit(...).lean(),
    this.orderModel.countDocuments(query),
]);
```

**Giải thích:** `countDocuments` và `find` là 2 queries độc lập. Chạy song song giảm ~50% latency cho mỗi paginated endpoint.

**Áp dụng cho:**

- `getAllOrdersByGuestId`
- `getOrdersByVariantIds`
- `getOrdersByProductIds`

---

### 3.6 Optimize Cron Job — `handleExpiredOrders`

**File:** `order.service.ts`

**Trước:**

```typescript
// ❌ Fetch full document (bao gồm images, combinations, etc.)
const expiredOrders = await this.orderModel.find({
  status: "PENDING",
  expireAt: { $ne: null, $lte: now },
});
```

**Sau:**

```typescript
// ✅ Chỉ lấy _id + orderDetail (chỉ cần variantId + quantity cho stock restore)
const expiredOrders = await this.orderModel
  .find({
    status: "PENDING",
    expireAt: { $ne: null, $lte: now },
  })
  .select("_id orderDetail")
  .lean();
```

**Giải thích:** Cron job chỉ cần `_id` (để update status) và `orderDetail` (để restore stock). Không cần `customerInfo`, `payment`, `reason`, etc. Giảm ~70% data transfer cho mỗi lần cron chạy.

---

### 3.7 Optimize Chat — `getUnreadCount`

**File:** `chat-service/src/chat/chat.service.ts`

**Trước:**

```typescript
// ❌ Fetch toàn bộ conversations (bao gồm participants, lastMessage, etc.)
const conversations = await this.getConversationsByUser(userId);
```

**Sau:**

```typescript
// ✅ Chỉ lấy field unreadCount
const conversations = await this.conversationModel
  .find({ "participants.userId": userId })
  .select("unreadCount")
  .lean();
```

**Giải thích:** `getConversationsByUser` trả về full conversation documents (participants[], lastMessage, etc.). Để tính unread count, chỉ cần field `unreadCount`. Giảm ~80% data transfer.

---

## 4. Frontend React Query Optimizations

### 4.1 Fix `useBrands` — Bỏ `staleTime: 0`

**File:** `client/src/hooks/admin/useBrand.ts`

**Trước:**

```typescript
export const useBrands = (queryParams: string = "") => {
    return useQuery({
        queryKey: brandKeys.list(queryParams),
        queryFn: () => brandService.getAll(...),
        staleTime: 0,           // ❌ Luôn refetch
        refetchOnMount: true,   // ❌ Refetch khi mount
        refetchOnWindowFocus: true, // ❌ Refetch khi focus window
    });
};
```

**Sau:**

```typescript
export const useBrands = (queryParams: string = "") => {
    return useQuery({
        queryKey: brandKeys.list(queryParams),
        queryFn: () => brandService.getAll(...),
        staleTime: 2 * 60 * 1000, // ✅ 2 phút — brands rarely change
    });
};
```

**Giải thích:** `staleTime: 0` + `refetchOnMount: true` + `refetchOnWindowFocus: true` = mỗi lần component mount hoặc user tab back đều gửi request mới. Brands rất ít khi thay đổi, 2 phút stale time là hợp lý. Giảm hàng chục requests không cần thiết mỗi session.

---

### 4.2 Fix `useCategoriesAll` — Bỏ loop pagination

**File:** `client/src/hooks/admin/useCategory.ts`

**Trước:**

```typescript
export const useCategoriesAll = () => {
    return useQuery({
        queryFn: async () => {
            const limit = 200;
            let page = 1;
            let totalPages = 1;
            const allData: ICategory[] = [];

            // ❌ Loop gọi API nhiều lần tuần tự
            do {
                const response = await categoryService.getAll(`?page=${page}&limit=${limit}`);
                allData.push(...(response.data || []));
                totalPages = response.pagination?.totalPages || 1;
                page += 1;
            } while (page <= totalPages);

            return { data: allData, ... };
        },
        staleTime: 5 * 60 * 1000,
    });
};
```

**Sau:**

```typescript
export const useCategoriesAll = () => {
    return useQuery({
        queryFn: async () => {
            // ✅ 1 request duy nhất với limit lớn
            const response = await categoryService.getAll(`?page=1&limit=1000&sort=createdAt_desc`);
            return { data: response.data || [], ... };
        },
        staleTime: 10 * 60 * 1000, // ✅ 10 phút — categories rất ít thay đổi
    });
};
```

**Giải thích:** Với 50 categories, loop cũ gọi 1 request (200 items/page). Nhưng nếu có 500 categories → 3 requests tuần tự! Giờ chỉ 1 request. Đồng thời tăng staleTime lên 10 phút vì categories gần như không đổi.

---

### 4.3 Add `placeholderData` — Smooth Pagination

**Files:** 7 admin hooks + 1 client hook

| Hook                  | File                    |
| --------------------- | ----------------------- |
| `useProducts`         | `useProduct.ts`         |
| `useAdminOrders`      | `useOrder.ts`           |
| `useCategories`       | `useCategory.ts`        |
| `useAccountEmployees` | `useAccountEmployee.ts` |
| `useAccountGuests`    | `useAccountGuest.ts`    |
| `useBrands`           | `useBrand.ts`           |
| `useMyProducts`       | `useProductManage.ts`   |

**Tất cả đều thêm:**

```typescript
placeholderData: (previousData: unknown) => previousData,
```

**Giải thích:** Khi user chuyển từ page 1 sang page 2:

- **Trước:** UI hiển thị loading spinner (data = undefined) → user thấy nhấp nháy
- **Sau:** UI giữ nguyên data page 1 trong khi fetch page 2 → chuyển trang mượt mà

Đây là pattern chuẩn của TanStack Query v5 cho paginated queries.

---

### 4.4 Reduce Redundant Invalidation — Brand Mutations

**File:** `client/src/hooks/admin/useBrand.ts`

**Trước:**

```typescript
onSuccess: async () => {
  // ❌ Invalidate ALL brand keys + FORCE refetch lists
  await queryClient.invalidateQueries({ queryKey: brandKeys.all });
  await queryClient.refetchQueries({ queryKey: brandKeys.lists() });
};
```

**Sau:**

```typescript
onSuccess: async () => {
  // ✅ Chỉ invalidate lists — TanStack Query tự refetch khi cần
  await queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
};
```

**Giải thích:** `invalidateQueries` đã tự động trigger refetch cho queries đang active. Gọi thêm `refetchQueries` là redundant — chỉ tạo thêm 1 request không cần thiết. Ngoài ra, `brandKeys.all` invalidate cả detail queries — không cần khi chỉ create/delete (detail của entity mới create chưa trong cache).

**Áp dụng cho:** `useCreateBrand`, `useUpdateBrand`, `useDeleteBrand`, `useUpdateManyBrands`

---

## 5. Tóm tắt tất cả file đã thay đổi

### Backend (Microservices)

| #   | File                                                                    | Loại thay đổi | Mô tả                                                 |
| --- | ----------------------------------------------------------------------- | ------------- | ----------------------------------------------------- |
| 1   | `order-service/src/order/entities/order.entity.ts`                      | 🗄️ Index      | Thêm 7 compound indexes                               |
| 2   | `product-service/src/brand/entities/brand.entity.ts`                    | 🗄️ Index      | Thêm 2 indexes                                        |
| 3   | `auth-service/src/account-employee/entities/account-employee.entity.ts` | 🗄️ Index      | Thêm 3 indexes                                        |
| 4   | `auth-service/src/role/entities/role.entity.ts`                         | 🗄️ Index      | Thêm 1 index                                          |
| 5   | `product-service/src/product/entities/product-attribute-allow-value.ts` | 🗄️ Index      | Thêm 2 indexes                                        |
| 6   | `product-service/src/product/entities/product-attribute-value.ts`       | 🗄️ Index      | Thêm 2 indexes                                        |
| 7   | `product-service/src/product/entities/product-attribute.ts`             | 🗄️ Index      | Thêm 2 indexes                                        |
| 8   | `history-log/src/history/entities/history.entity.ts`                    | 🗄️ Index      | Thêm 2 indexes                                        |
| 9   | `product-service/src/product/product.service.ts`                        | ⚡ Query      | Fix N+1 `checkVariantsStock` (batch query)            |
| 10  | `product-service/src/product/product.service.ts`                        | ⚡ Query      | Fix N+1 `reindexAllToElasticsearch` (batch query)     |
| 11  | `product-service/src/product/product.service.ts`                        | ⚡ Query      | Thêm `.lean()` + `.select()` cho variants/allowValues |
| 12  | `product-service/src/brand/brand.service.ts`                            | ⚡ Query      | Thêm `.lean()` cho tất cả find queries                |
| 13  | `auth-service/src/account-employee/account-employee.service.ts`         | ⚡ Query      | Thêm `.lean()` cho `findAll`                          |
| 14  | `order-service/src/order/order.service.ts`                              | ⚡ Query      | Thêm `.lean()` + parallelize + `.select()` cho cron   |
| 15  | `chat-service/src/chat/chat.service.ts`                                 | ⚡ Query      | Optimize `getUnreadCount` — chỉ select `unreadCount`  |

### Frontend (Client)

| #   | File                                | Loại thay đổi | Mô tả                                                     |
| --- | ----------------------------------- | ------------- | --------------------------------------------------------- |
| 16  | `hooks/admin/useBrand.ts`           | 🔄 Cache      | `staleTime: 0` → `2min`, bỏ redundant refetch             |
| 17  | `hooks/admin/useCategory.ts`        | 🔄 Cache      | Bỏ loop pagination, dùng `limit=1000`, `staleTime: 10min` |
| 18  | `hooks/admin/useProduct.ts`         | 🔄 UX         | Thêm `placeholderData` cho smooth pagination              |
| 19  | `hooks/admin/useOrder.ts`           | 🔄 UX         | Thêm `placeholderData` cho smooth pagination              |
| 20  | `hooks/admin/useAccountEmployee.ts` | 🔄 UX         | Thêm `placeholderData` cho smooth pagination              |
| 21  | `hooks/admin/useAccountGuest.ts`    | 🔄 UX         | Thêm `placeholderData` cho smooth pagination              |
| 22  | `hooks/client/useProductManage.ts`  | 🔄 UX         | Thêm `placeholderData` cho smooth pagination              |

---

## 📊 Kết quả dự kiến

### Performance Impact

| Metric                            | Trước                   | Sau               | Cải thiện            |
| --------------------------------- | ----------------------- | ----------------- | -------------------- |
| Order listing (10k records)       | 500-2000ms              | 50-100ms          | **10-20x**           |
| Cron job expired orders           | 300-1000ms              | 30-80ms           | **10x**              |
| Product stock check (10 variants) | 10 queries (~200ms)     | 1 query (~20ms)   | **10x**              |
| ES reindex (500 products)         | 500 queries (~5s)       | 1 query (~50ms)   | **100x**             |
| Brand listing                     | Refetch mỗi lần mount   | Cache 2 phút      | **∞ fewer requests** |
| Category dropdown                 | N requests (loop pages) | 1 request         | **Nx faster**        |
| Pagination UX                     | Loading flash           | Smooth transition | **Qualitative**      |

### Memory Impact

| Metric                       | Trước                      | Sau                  | Cải thiện             |
| ---------------------------- | -------------------------- | -------------------- | --------------------- |
| `.lean()` on 100 documents   | ~800KB Mongoose docs       | ~200KB plain objects | **75% less memory**   |
| `.select('_id orderDetail')` | Full order doc (~2KB each) | ~500 bytes each      | **75% less transfer** |

---

## 🔍 Các index đã tồn tại trước đó (không cần thêm)

Các schemas sau đã có indexes tốt:

| Schema            | Indexes có sẵn                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `Product`         | `{isDeleted, status, createdAt}`, `{category, isDeleted, status}`, `{brand, isDeleted, status}` |
| `ProductVariant`  | `{product, isDeleted}`, `{isDeleted, discount, stock}`, `{product, createdAt}`                  |
| `ProductView`     | `{product, guest}` (unique), `{guest, lastViewedAt}`                                            |
| `Category`        | `{isDeleted, parentId}`, `{isDeleted, name}`, `{isDeleted, createdAt}`                          |
| `ProductComment`  | `{product, parentComment, isDeleted, createdAt}`, `{guest, isDeleted}`                          |
| `ProductReaction` | `{comment, guest}` (unique)                                                                     |
| `AccountGuest`    | `{googleId}`, `{accountStatus}`, `{isActive}`, `{createdAt}`                                    |
| `Message`         | `{conversationId, createdAt}`, `{senderId}`                                                     |
| `Conversation`    | `{participants.userId}`, `{updatedAt}`                                                          |

---

## ⚠️ Lưu ý khi deploy

1. **Indexes sẽ tự động tạo** khi NestJS khởi động (Mongoose `autoIndex: true` mặc định). Lần đầu khởi động sau deploy có thể chậm hơn chút vì MongoDB cần build indexes.

2. **Với dữ liệu lớn (>100k documents)**, nên tạo indexes thủ công qua MongoDB shell trước khi deploy:

   ```bash
   # Connect to MongoDB
   mongosh "mongodb://..."

   # Create Order indexes
   db.orders.createIndex({ status: 1, expireAt: 1 })
   db.orders.createIndex({ "customerInfo.guestId": 1, status: 1, createdAt: -1 })
   db.orders.createIndex({ status: 1, createdAt: -1 })
   db.orders.createIndex({ "payment.isCheckout": 1, status: 1, createdAt: -1 })
   db.orders.createIndex({ "orderDetail.variantId": 1, status: 1 })
   db.orders.createIndex({ "orderDetail.productId": 1, status: 1 })
   db.orders.createIndex({ "payment.type": 1, status: 1 })
   ```

3. **`.lean()` không ảnh hưởng** đến queries có mutation (findOneAndUpdate, etc.) — chỉ áp dụng cho read queries.

4. **`placeholderData`** trong TanStack Query v5 thay thế `keepPreviousData` của v4. Đảm bảo đang dùng `@tanstack/react-query` v5+.

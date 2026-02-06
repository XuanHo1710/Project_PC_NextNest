# Project PC — Architecture Document

> **Last updated:** 2026-02-06
>
> **⚠️ QUAN TRỌNG:** Folder `/server` là backend **OLD VERSION** (monolith NestJS). **TUYỆT ĐỐI KHÔNG ĐƯỢC ĐỤNG VÀO.** Toàn bộ backend mới nằm trong `/microservices`.

---

## 1. Tổng quan hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js 16)                      │
│                        Port: 3000                               │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────────┐ │
│  │ (admin)  │  │   (client)   │  │     Shared Components      │ │
│  │ /admin/* │  │  /home, etc  │  │  types/ services/ hooks/   │ │
│  └──────────┘  └──────────────┘  └────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP (REST)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API GATEWAY (NestJS)                           │
│                   Port: from .env (default 8080)                │
│                   Prefix: /api/v1/*                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ AdminModule  │  │ ClientModule │  │ TransformInterceptor  │  │
│  │ /api/v1/     │  │ /api/v1/     │  │ ExceptionFilter       │  │
│  │ admin/*      │  │ client/*     │  │ Swagger /api/docs     │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────────┘  │
│         │                 │                                      │
└─────────┼─────────────────┼──────────────────────────────────────┘
          │   TCP            │   TCP
          ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│  AUTH SERVICE   │  │ PRODUCT SERVICE │
│  TCP Port: 3001 │  │ TCP Port: 3002  │
│  + Redis PubSub │  │ + Redis PubSub  │
│                 │  │                 │
│  Modules:       │  │  Modules:       │
│  - auth/        │  │  - product/     │
│  - account-     │  │  - category/    │
│    employee/    │  │  - brand/       │
│  - account-     │  │                 │
│    guest/       │  │                 │
│  - role/        │  │                 │
└─────────────────┘  └─────────────────┘
          │                  │
          ▼                  ▼
    ┌─────────────────────────────┐
    │        MongoDB              │
    │   + Redis (Cache/PubSub)    │
    └─────────────────────────────┘
```

---

## 2. API Response Format (Chuẩn chung)

Tất cả API endpoints đều trả về cùng 1 format thông qua `TransformInterceptor`:

```typescript
// Cả gateway lẫn old server đều dùng cùng format này
{
  "statusCode": 200,
  "message": "",
  "data": { ... },         // <-- Dữ liệu thực tế nằm ở đây
  "timestamp": "2026-02-06T06:48:48.330Z"
}
```

### Client Types tương ứng:

```typescript
// client/src/types/index.d.ts
interface APIResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

interface PageResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit?: number;
}
```

### Lưu ý quan trọng:

- Axios interceptor (`response.data`) đã unwrap 1 lần → service nhận được `{ statusCode, message, data, timestamp }`
- Nhưng interceptor hiện tại trả `response.data` → nghĩa là service nhận **trực tiếp phần `data`** luôn (đã unwrap cả envelope).
- Nếu cần pagination: API trả `data: { items: [...], totalItems, totalPages, currentPage }`

---

## 3. Frontend Architecture (client/)

### 3.1 Cấu trúc thư mục

```
client/src/
├── app/                          # Next.js App Router
│   ├── (admin)/admin/            # Admin panel routes
│   ├── (client)/                 # Client-facing routes (home, product, cart...)
│   ├── api/                      # Next.js API routes (if any)
│   └── layout.tsx                # Root layout
├── components/
│   ├── client/                   # Client-specific components
│   │   ├── CardProduct/          # Product card (dùng productHelpers)
│   │   ├── Cart/                 # Cart components
│   │   ├── CreateProduct/        # Client-side product creation
│   │   ├── Layout/               # Client layout (Header, Footer)
│   │   └── ProductDetail/        # Product detail sub-components
│   ├── common/                   # Shared components (DynamicMetadata, etc.)
│   ├── Content/                  # Admin content tables
│   ├── ContentModal/             # Admin modal forms
│   └── ui/                       # ShadCN/Radix UI primitives
├── config/
│   ├── axios.tsx                 # Admin axios instance (baseURL: /api/v1/admin/)
│   ├── axiosClient.tsx           # Client axios instance (baseURL: /api/v1/)
│   └── route.tsx                 # Route path constants
├── hooks/
│   ├── admin/                    # Admin hooks (useEmployee, useProductAttribute, etc.)
│   ├── client/                   # Client hooks (useProductManage, etc.)
│   ├── useCart.ts                # Cart state (Zustand)
│   └── useAuthUser.ts           # Client auth state (Zustand)
├── services/
│   ├── admin/                    # Admin service classes (BaseService<T> pattern)
│   └── client/                   # Client service classes
├── types/                        # TypeScript type definitions
│   ├── index.d.ts                # APIResponse<T>, PageResponse<T> + re-exports
│   ├── product.d.ts              # IProduct, IProductCard, IProductVariant, etc.
│   ├── account-employee.d.ts     # IAccountEmployee
│   ├── account-guest.d.ts        # IAccountGuest
│   └── ...                       # category, brand, role, order, etc.
└── utils/
    ├── productHelpers.ts         # Helper functions cho IProductCard
    └── metadata.ts               # SEO metadata generators
```

### 3.2 Product Data Model (Microservice)

Product data theo microservice architecture:

```typescript
// Product KHÔNG có images/price trực tiếp
// Tất cả thông tin hiển thị lấy từ defaultVariant
interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string; // ObjectId ref
  category?: string; // ObjectId ref
  minPrice: number; // computed from variants
  maxPrice: number; // computed from variants
  status: "ACTIVE" | "INACTIVE" | "STOPSOLD";
  defaultProductVariantId?: string;
}

// Variant chứa toàn bộ thông tin giá, ảnh, stock
interface IProductVariant {
  _id: string;
  sku: string;
  product: string;
  price: number; // giá gốc
  discount: number; // 0-100 (%)
  stock: number;
  images: string[];
  combination: Record<string, string>;
}

// IProductCard dùng cho listing/grid
// defaultVariant đã được populate sẵn
interface IProductCard {
  _id: string;
  name: string;
  slug: string;
  defaultVariant?: {
    price: number;
    discount: number;
    images: string[];
    combination: Record<string, string>;
  };
  brand?: { _id: string; name: string };
  category?: { _id: string; name: string; slug: string };
  // ...
}
```

### 3.3 ProductHelpers (BẮT BUỘC dùng)

```typescript
// ❌ SAI — Không bao giờ truy cập trực tiếp
product.images[0]; // KHÔNG TỒN TẠI trên IProductCard
product.newPrice; // KHÔNG TỒN TẠI
product.oldPrice; // KHÔNG TỒN TẠI
product.discount; // KHÔNG TỒN TẠI

// ✅ ĐÚNG — Luôn dùng helper functions
import {
  getProductDisplayPrice, // Giá sau discount
  getProductOriginalPrice, // Giá gốc (variant.price)
  getProductDiscount, // % discount
  getProductImage, // Ảnh đầu tiên
  getProductImages, // Tất cả ảnh
  getProductSoldCount, // Số lượng đã bán
  getProductStock, // Tồn kho
  formatCurrencyVND, // Format tiền VND
} from "@/utils/productHelpers";
```

---

## 4. Microservice Architecture (microservices/)

### 4.1 Cấu trúc

```
microservices/
├── turbo.json                    # Turborepo orchestration
├── package.json                  # Workspace root (npm workspaces)
├── apps/
│   ├── api-gateway/              # HTTP Gateway (NestJS) — Duy nhất nhận HTTP
│   │   └── src/
│   │       ├── admin/            # Admin routes → proxy to services via TCP
│   │       ├── client/           # Client routes → proxy to services via TCP
│   │       ├── core/             # TransformInterceptor, ExceptionFilter
│   │       ├── guards/           # JWT Guards
│   │       └── main.ts           # Port from .env, prefix /api, version v1
│   ├── auth-service/             # Auth microservice (TCP :3001 + Redis)
│   │   └── src/
│   │       ├── auth/             # Login, register, refresh token
│   │       ├── account-employee/ # Employee CRUD
│   │       ├── account-guest/    # Guest CRUD
│   │       ├── role/             # Role/permission management
│   │       └── redis/            # Redis pub/sub handlers
│   └── product-service/          # Product microservice (TCP :3002 + Redis)
│       └── src/
│           ├── product/          # Product CRUD + variants + attributes
│           ├── category/         # Category management
│           └── brand/            # Brand management
└── packages/
    └── common/                   # Shared package (@project-pc/common)
        └── src/
            ├── constants/        # MICROSERVICE_PORT, USER_ROLE, service names
            └── dto/              # All DTOs (shared between services)
```

### 4.2 Communication Flow

```
Client (browser)
  │
  ├── HTTP GET /api/v1/products
  │         │
  │    API Gateway
  │         │
  │    client.send({ cmd: 'GET_PRODUCTS' }, payload)
  │         │
  │    TCP ──────► Product Service (port 3002)
  │         │           │
  │         │      MongoDB query
  │         │           │
  │    TCP ◄──────  response data
  │         │
  │    TransformInterceptor wraps: { statusCode, message, data, timestamp }
  │         │
  └── HTTP Response ← { statusCode: 200, data: [...], ... }
```

### 4.3 Ports

| Service         | Transport | Port                       |
| --------------- | --------- | -------------------------- |
| API Gateway     | HTTP      | .env `PORT` (default 8080) |
| Auth Service    | TCP       | 3001                       |
| Product Service | TCP       | 3002                       |
| Redis           | TCP       | .env `REDIS_PORT`          |
| MongoDB         | TCP       | .env `MONGODB_URI`         |

### 4.4 Shared DTOs (packages/common)

| Domain            | DTOs                                                                     |
| ----------------- | ------------------------------------------------------------------------ |
| Auth              | LoginDto, RefreshTokenDto, TokenResponseDto, LogoutDto                   |
| Account Guest     | CreateGuestDto, UpdateGuestDto                                           |
| Account Employee  | CreateAccountEmployeeDto, UpdateAccountEmployeeDto                       |
| Role              | CreateRoleDto, UpdateRoleDto                                             |
| Product           | CreateProductDto, UpdateProductDto, SearchProductDto                     |
| Product Variant   | CreateProductVariantDto, UpdateProductVariantDto                         |
| Product Attribute | CreateProductAttributeDto, UpdateProductAttributeDto                     |
| Attribute Value   | CreateProductAttributeValueDto, UpdateProductAttributeValueDto           |
| Allow Value       | CreateProductAttributeAllowValueDto, UpdateProductAttributeAllowValueDto |
| Category          | CreateCategoryDto, UpdateCategoryDto                                     |
| Brand             | CreateBrandDto, UpdateBrandDto, SearchBrandDto                           |

---

## 5. Entities (Database Models)

### Auth Service Entities

| Entity          | Key Fields                                                  |
| --------------- | ----------------------------------------------------------- |
| AccountEmployee | IDEmp, username, password, employeeId, role, email, phone   |
| AccountGuest    | email, avatar, authProvider, accountStatus, addresses, cart |
| Role            | name, description, isActive, permissions[]                  |

### Product Service Entities

| Entity                     | Key Fields                                                |
| -------------------------- | --------------------------------------------------------- |
| Product                    | name, slug, brand, category, minPrice, maxPrice, status   |
| ProductVariant             | sku, product, price, stock, discount, images, combination |
| ProductAttribute           | name, code, displayType (COLOR/IMAGE/BUTTON/RADIO)        |
| ProductAttributeValue      | value, label, attribute, colorHex, imageUrl               |
| ProductAttributeAllowValue | product, attributeValue                                   |
| Category                   | name, slug, parent, children, image                       |
| Brand                      | name, slug, logo, description                             |

---

## 6. Client Axios Configuration

### Hai axios instance riêng biệt:

| Instance      | File                   | Base URL                              | Dùng cho     |
| ------------- | ---------------------- | ------------------------------------- | ------------ |
| `instance`    | config/axios.tsx       | `http://localhost:8080/api/v1/admin/` | Admin panel  |
| `axiosClient` | config/axiosClient.tsx | `NEXT_PUBLIC_API_URL` hoặc fallback   | Client pages |

### Response flow:

```
Axios response
  → interceptor: return response.data
    → Service nhận được object { statusCode, message, data, timestamp }
    → Service cast: response as unknown as T (lấy .data nếu cần)
```

---

## 7. Development Commands

```bash
# Start microservices (all at once via Turborepo)
cd microservices
npm install
npm run start:dev

# Start client (Next.js)
cd client
npm run dev

# Start old server (KHÔNG NÊN DÙNG - old version)
# cd server && npm run start:dev
```

---

## 8. Quy tắc & Convention

### ❌ KHÔNG ĐƯỢC:

- Đụng vào folder `/server` (old monolith, deprecated)
- Dùng `product.images`, `product.newPrice`, `product.oldPrice` trực tiếp
- Dùng `IEmployee`, `IGuest` (đã xóa — chỉ dùng `IAccountEmployee`, `IAccountGuest`)
- Truy cập `response.pagination.totalItems` (cấu trúc cũ)

### ✅ BẮT BUỘC:

- Dùng `productHelpers.ts` cho mọi computed product field
- Types match microservice entities (product.d.ts, account-employee.d.ts, etc.)
- API responses theo format `{ statusCode, message, data, timestamp }`
- Pagination response: `{ items: T[], totalItems, totalPages, currentPage, limit? }`
- Service classes pattern cho API calls
- TanStack Query cho data fetching
- Zustand cho client state (cart, auth)

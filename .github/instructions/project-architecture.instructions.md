---
description: >-
  Complete architecture guide for Project PC — an e-commerce platform built with
  Next.js frontend and NestJS microservices backend. Covers response formats,
  React Query patterns, service layer, state management, and microservice
  communication. Apply when working on any code in the project.
applyTo: "**"
---

# Project PC — Architecture & Conventions

> **⚠️ CRITICAL:** The `/server` folder contains the **OLD monolith** (deprecated). **NEVER touch it.** All backend code lives in `/microservices`.

---

## 1. System Architecture

```
Client (Next.js)         → HTTP REST →  API Gateway (NestJS, port 8080)
                                            ├── TCP  → Auth Service     (port 3001)
                                            ├── RMQ  → Product Service  (port 3002)
                                            ├── TCP  → History Log      (port 3003)
                                            ├── TCP  → Cart Service     (port 3004)
                                            ├── TCP  → Payment Service  (port 3005)
                                            ├── TCP  → Order Service    (port 3006)
                                            ├── TCP  → Notification     (port 3007)
                                            ├── TCP  → Saga Orchestrator(port 3008)
                                            ├── TCP  → Chat Service     (port 3009)
                                            └── TCP  → Elasticsearch    (port 3010)
```

- **Monorepo**: Turborepo with `microservices/apps/*` and `microservices/packages/*`
- **Shared package**: `@project-pc/common` — DTOs, constants, enums
- **Database**: MongoDB (Mongoose) + Redis (cache/pub-sub)
- **Message broker**: RabbitMQ for product-service (with DLQ + 5-retry), TCP for others

---

## 2. API Response Format (Standard)

### Success Response (TransformInterceptor)

```typescript
{
  "statusCode": 200,
  "message": "",           // Custom via @ResponseMessage()
  "data": { ... },         // Actual payload
  "timestamp": "2026-02-06T06:48:48.330Z"
}
```

### Error Response (AllExceptionsFilter)

```typescript
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "data": null,
  "timestamp": "...",
  "path": "/api/v1/admin/product"
}
```

### Pagination Response

When endpoints return paginated data, `data` contains:

```typescript
{
  "items": T[],
  "totalItems": number,
  "totalPages": number,
  "currentPage": number,
  "limit?": number
}
```

---

## 3. Axios Configuration

Two separate instances, each with token refresh queue:

| Instance      | File                     | Base URL         | Usage        |
| ------------- | ------------------------ | ---------------- | ------------ |
| `instance`    | `config/axios.tsx`       | `/api/v1/admin/` | Admin panel  |
| `axiosClient` | `config/axiosClient.tsx` | `/api/v1/client` | Client pages |

### Response Unwrapping

Axios interceptors call `return response.data`, so services receive the **unwrapped envelope data directly** (not the `{ statusCode, message, data, timestamp }` wrapper).

### Token Refresh Queue Pattern

```typescript
// Both instances implement the same pattern:
let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];
// Prevents multiple simultaneous refresh calls
// Queues pending requests during refresh, replays once token is refreshed
```

---

## 4. Service Layer

### Admin Services — BaseService&lt;T&gt; Pattern

```typescript
// services/admin/base.service.ts
class BaseService<T> {
  constructor(private endpoint: string) {}
  async getAll(queryParams = ""): Promise<PaginatedResponse<T>>;
  async getById(id: string): Promise<T>;
  async create(data: Omit<T, "_id">): Promise<{ data: T; status }>;
  async update(id: string, data: Partial<T>): Promise<{ data: T; status }>;
  async delete(id: string): Promise<{ status }>;
  async updateMany(ids: string[], typeUpdate: string): Promise<{ status }>;
}

// Concrete services are simple wrappers:
class ProductService extends BaseService<IProduct> {
  constructor() {
    super("product");
  }
}
export const productService = new ProductService();
```

### Client Services — Custom Methods

Client services do NOT extend BaseService. They define custom methods per domain:

- `product.client.service.ts` — 25+ methods (getProducts, getBySlug, search, wishlist, comments)
- `auth.client.service.ts` — login, register, logout, getProfile, googleLogin
- `account.client.service.ts` — profile, addresses, favorites, stats
- `cart.client.service.ts` — updateCart, getOne (deduplicates by `variant._id`)
- `interaction.client.service.ts` — comments, replies, reactions
- `product-manage.client.service.ts` — guest product creation, attributes, variants

---

## 5. React Query (TanStack) Patterns

### Query Keys — Hierarchical Structure

```typescript
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: string) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};
```

### Query Hooks

```typescript
export const useProducts = (queryParams: string = "") => {
  return useQuery({
    queryKey: productKeys.list(queryParams),
    queryFn: () => productService.getAll(queryParams ? `?${queryParams}` : ""),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Mutation Hooks — with Invalidation + Toast

```typescript
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Thêm sản phẩm thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Thêm sản phẩm thất bại: ${error.message}`);
    },
  });
};
```

### Pagination Pattern (Client Hooks)

```typescript
export const useMyProducts = (page = 1, limit = 10, search?: string) => {
  return useQuery({
    queryKey: clientProductKeys.myProducts(page, limit, search),
    queryFn: () =>
      service.getMyProducts({ page, limit, ...(search ? { search } : {}) }),
    staleTime: 2 * 60 * 1000,
  });
};
```

### Optimistic Updates with Debounce

```typescript
// useToggleReaction pattern:
// 1. Optimistic cache update (immediate UI change)
// 2. Debounce API call (600ms) to batch rapid toggles
// 3. On error: invalidate queries to revert
```

### Critical Rules

- **ONLY** call TanStack Query hooks inside React components or other hooks
- **NEVER** call service methods directly in React components (except auth login/register/logout)
- Service methods are called **inside** `queryFn` / `mutationFn`

---

## 6. State Management (Zustand)

### Cart Store (`useCart.ts`)

```typescript
interface CartState {
  cart: ICart | null;
  addToCart: (product: IProductCard, variant: CartVariant, quantity?) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  clearCart: () => void;
  setCart: (cart: ICart) => void;
  calculateTotal: () => number;
}
```

- **Key**: Each `variant._id` = separate line item; same variant → increase quantity (capped at stock)
- **Persistence**: localStorage hydration on client mount
- **Sync**: Debounced server sync (2 seconds) when user is logged in

### Auth Store (`useAuthUser.ts`)

```typescript
interface AuthUserState {
  user: IClientUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login / register / logout / loginWithGoogle / handleGoogleCallback
}
```

- Uses Next.js API routes for auth (httpOnly cookies)
- Google OAuth via popup + `postMessage`

---

## 7. Product Data Model

### ❌ NEVER access directly

```typescript
product.images; // DOES NOT EXIST on IProductCard
product.newPrice; // DOES NOT EXIST
product.oldPrice; // DOES NOT EXIST
product.discount; // DOES NOT EXIST
```

### ✅ ALWAYS use productHelpers

```typescript
import {
  getProductDisplayPrice, // price * (1 - discount/100)
  getProductOriginalPrice, // base price from defaultVariant
  getProductDiscount, // % discount from defaultVariant
  getProductImage, // first image from defaultVariant
  getProductImages, // all images from defaultVariant
  getProductStock, // stock from defaultVariant
  formatCurrencyVND, // "1,000,000 đ"
  getDefaultCartVariant, // builds variant object for cart
} from "@/utils/productHelpers";
```

### Type Hierarchy

```typescript
// IProduct — base entity (no images/price directly)
// All display info comes from defaultVariant
interface IProduct {
  _id: string;
  name: string;
  slug: string;
  minPrice: number;
  maxPrice: number;
  status: "PENDING" | "ACTIVE" | "INACTIVE" | "STOPSOLD";
  defaultProductVariantId?: string;
  defaultVariant?: { price; discount; images; combination; stock };
}

// IProductCard — for listing/grid (populated refs)
interface IProductCard {
  _id: string;
  name: string;
  slug: string;
  defaultVariant?: { price; discount; images; combination; stock };
  brand?: { _id; name; logo? };
  category?: { _id; name; slug };
  avgRating?: number;
  totalRatings?: number;
}

// IProductVariant — carries ALL pricing/image/stock info
interface IProductVariant {
  _id: string;
  sku: string;
  product: string;
  price: number;
  stock: number;
  discount: number; // 0-100%
  combination: Record<string, string>; // { CPU: "i9", RAM: "32GB" }
  images: string[];
}
```

---

## 8. Microservice Communication

### Gateway → Service (API Gateway Controllers)

```typescript
// Request-Response (awaits reply):
this.productServiceClient.send({ cmd: "product.findAll" }, payload);

// Fire-and-Forget (no reply):
this.productServiceClient.emit("product.view.track", payload);
```

### Service → Handler (Microservice Controllers)

```typescript
@MessagePattern('product.findAll')
async findAll(@Payload() data, @Ctx() context: RmqContext) {
  return handleRmq(context, async () => {
    return this.productService.findAllProducts(data);
  });
}
```

### RMQ with Dead Letter Queue

Stock operations use DLQ with 5-retry threshold:

```typescript
// On failure: check x-death header count
// If retries < 5: nack (requeue via DLQ with 5s TTL)
// If retries >= 5: ack (discard, log error)
```

### Elasticsearch Events (Fire-and-Forget)

```typescript
this.esClient.emit("es.product.updated", productWithRefs);
this.esClient.emit("es.variant.upserted", { product, variant });
this.esClient.emit("es.product.deleted", { productId });
```

---

## 9. Authentication & Guards

### Admin Auth

- **Strategy**: Local (IDEmp + password) → JWT
- **Guard**: `JwtAuthGuard` — validates JWT + checks role permissions against `method + path`
- **Decorator**: `@Employee()` injects employee from request

### Client Auth

- **Strategy**: Email + password → JWT; Google OAuth popup
- **Guard**: `ClientJwtAuthGuard` — optional for `@Public()` routes, strict for protected
- **Decorator**: `@Guest()` injects guest from request

### Custom Decorators

```typescript
@Public()                    // Skip JWT validation
@Employee()                  // Inject employee from request
@Guest()                     // Inject guest from request
@ResponseMessage(message)    // Set custom response envelope message
```

---

## 10. Shared Package (`@project-pc/common`)

### Constants

```typescript
MICROSERVICE = {
  AUTH_SERVICE, PRODUCT_SERVICE, REDIS_SERVICE,
  HISTORY_LOG_SERVICE, CART_SERVICE, PAYMENT_SERVICE,
  ORDER_SERVICE, NOTIFICATION_SERVICE, SAGA_ORCHESTRATOR_SERVICE,
  CHAT_SERVICE, ELASTICSEARCH_SERVICE
}

USER_ROLE = { GUEST, USER, ADMIN, SUPER_ADMIN }

MICROSERVICE_PORT = {
  AUTH_SERVICE: 3001, PRODUCT_SERVICE: 3002, ...
}
```

### DTO Directories

DTOs shared between gateway and services:
`auth/`, `account-guest/`, `account-employee/`, `role/`, `product/`, `product-variant/`,
`product-attribute/`, `product-attribute-value/`, `product-attribute-allow-value/`,
`category/`, `brand/`, `cart/`, `order/`, `payment/`, `notification/`, `history/`,
`product-interaction/`

All follow `CreateXxxDto` + `UpdateXxxDto` (PartialType) + optional `SearchXxxDto`.

---

## 11. Database Patterns (MongoDB/Mongoose)

- **Timestamps**: All schemas use `{ timestamps: true }`
- **Slugs**: Auto-generated via `slugify` on name fields
- **Soft Delete**: `isDeleted: boolean` + `deletedAt: Date` fields
- **Refs**: ObjectId references with optional populate
- **Per-user isolation**: Attributes/values use `createdBy` field for guest-created data
- **Price Recomputation**: After variant create/update/delete → recalculate product's `minPrice`/`maxPrice`
- **Hierarchical Categories**: Tree structure with `parent`/`children` refs + recursive descendant queries

---

## 12. Frontend Conventions

### File Structure

```
client/src/
├── app/(admin)/admin/    # Admin panel routes
├── app/(client)/         # Client-facing routes
├── components/client/    # Client-specific components
├── components/ui/        # ShadCN/Radix UI primitives
├── config/               # Axios instances
├── hooks/admin/          # Admin React Query hooks
├── hooks/client/         # Client React Query hooks
├── services/admin/       # Admin services (BaseService<T>)
├── services/client/      # Client services (custom methods)
├── types/                # TypeScript type definitions
└── utils/                # Helpers (productHelpers, metadata)
```

### Styling

- TailwindCSS + Ant Design components
- Container pattern: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Responsive grids: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5`

### Providers

- `AuthProviderClient` — listens for Google OAuth `postMessage`, fetches profile on mount
- `CartProviderClient` — merges localStorage cart with server cart on login
- `QueryProvider` — TanStack `QueryClientProvider`
- `ChatSocketProvider` — Socket.io for real-time chat

### TypeScript Types

- `APIResponse<T>` — standard envelope: `{ statusCode, message, data: T, timestamp }`
- `PaginatedResponse<T>` — `{ data: T[], pagination: { currentPage, totalPages, totalItems } }`
- `IProductCard` — for listing (populated defaultVariant, brand, category)
- `IProductVariant` — carries price, stock, discount, images, combination
- `ICartItem` — product (for display) + variant (for pricing) + quantity + subtotal
- `IAccountGuest` — email, avatar, authProvider, addresses, favorites, loyalty

---

## 13. Development Commands

```bash
# Start all microservices (Turborepo)
cd microservices && npm run start:dev

# Start frontend
cd client && npm run dev

# Build shared package
cd microservices && npx turbo run build --filter=@project-pc/common
```

---

## 14. Absolute Rules

### ❌ NEVER

- Touch `/server` folder (deprecated monolith)
- Access `product.images`, `product.newPrice`, `product.oldPrice` directly
- Use `IEmployee`, `IGuest` (deleted types — use `IAccountEmployee`, `IAccountGuest`)
- Access `response.pagination.totalItems` (old structure)
- Call service methods directly in React components (except auth login/register/logout)
- Use `mx-5 xl:mx-32` for container padding (use `max-w-7xl mx-auto` pattern)

### ✅ ALWAYS

- Use `productHelpers.ts` for all computed product display fields
- Use TanStack Query hooks for data fetching (never raw service calls in components)
- Use Zustand stores for client state (cart, auth)
- Follow `{ statusCode, message, data, timestamp }` response format
- Use shared DTOs from `@project-pc/common` for validation
- Use `handleRmq(context, handler)` pattern in microservice message handlers
- Use hierarchical query keys for cache management

# Project PC - Microservices

Monorepo architecture với Turborepo, NestJS microservices và shared packages.

## 📁 Cấu Trúc

```
microservices/
├── apps/
│   ├── api-gateway/      # API Gateway (public endpoints)
│   ├── auth-service/     # Authentication service
│   └── product-service/  # Product management service
├── packages/
│   ├── common/          # ✅ Shared DTOs & utilities
│   ├── eslint-config/   # Shared ESLint config
│   ├── typescript-config/ # Shared TS config
│   └── ui/              # Shared UI components
└── turbo.json           # Turborepo configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Common Package (Required First!)

```bash
# Linux/Mac
npm run build --workspace=@project-pc/common

# Hoặc dùng script
./build-common.sh      # Linux/Mac
build-common.bat       # Windows
```

### 3. Start All Services

```bash
npm run start:dev
```

## 📦 Shared DTOs (@project-pc/common)

### Import trong bất kỳ service nào:

```typescript
import {
  LoginDto,
  RefreshTokenDto,
  CreateAccountGuestDto,
  TokenResponseDto,
} from "@project-pc/common";
```

### Xem thêm:

- 📖 [Usage Guide](./USAGE_GUIDE.ts) - Chi tiết cách sử dụng
- ✅ [Fix Summary](./FIX_SUMMARY.md) - Log những gì đã fix
- 📚 [Common Package README](./packages/common/README.md)

## 🛠️ Development

### Start services riêng lẻ:

```bash
# API Gateway
cd apps/api-gateway && npm run start:dev

# Auth Service
cd apps/auth-service && npm run start:dev

# Product Service
cd apps/product-service && npm run start:dev
```

### Build all:

```bash
npm run build
```

### Lint:

```bash
npm run lint
```

## ⚠️ Important Notes

1. **Common package MUST be built first** trước khi start services
2. Mỗi khi thêm DTO mới vào common, phải rebuild: `npm run build -w @project-pc/common`
3. Services tự động restart khi có thay đổi (watch mode)
4. Turbo caching giúp build nhanh hơn

## 🎯 Available DTOs

- ✅ `LoginDto` - Email & password login
- ✅ `RefreshTokenDto` - Token refresh
- ✅ `TokenResponseDto` - Auth response
- ✅ `LogoutDto` - Logout with optional token
- ✅ `CreateAccountGuestDto` - Guest account creation

## 📝 Thêm DTO Mới

1. Tạo trong `packages/common/src/dto/[module]/`
2. Export trong `packages/common/src/dto/index.ts`
3. Build: `npm run build -w @project-pc/common`
4. Import ở service: `import { YourDto } from '@project-pc/common'`

## 🔧 Tech Stack

- **Monorepo**: Turborepo
- **Framework**: NestJS
- **Language**: TypeScript
- **Validation**: class-validator
- **Communication**: Microservices pattern với message queues

---

**📖 Need help?** Xem [USAGE_GUIDE.ts](./USAGE_GUIDE.ts) hoặc [FIX_SUMMARY.md](./FIX_SUMMARY.md)!

# @project-pc/common

Shared common package cho Project PC microservices.

## Cài đặt

Package này được quản lý bởi npm workspaces. Mọi service trong monorepo có thể sử dụng trực tiếp.

## Cách sử dụng

### Import DTOs

```typescript
// Import từ @project-pc/common
import {
  LoginDto,
  RefreshTokenDto,
  CreateAccountGuestDto,
} from "@project-pc/common";

// Sử dụng trong controller
@Controller("auth")
export class AuthController {
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    // Your logic here
  }
}
```

### Các DTO có sẵn

#### Auth DTOs

- `LoginDto` - DTO cho login với email và password
- `RefreshTokenDto` - DTO cho refresh token
- `TokenResponseDto` - Response DTO với access_token và refresh_token
- `LogoutDto` - DTO cho logout (optional refresh token)

#### Account Guest DTOs

- `CreateAccountGuestDto` - DTO để tạo tài khoản guest mới

## Development

### Build package

```bash
cd packages/common
npm run build
```

### Clean dist

```bash
npm run clean
```

## Thêm DTO mới

1. Tạo file DTO trong `src/dto/[module-name]/`
2. Export trong `src/dto/index.ts`
3. Build lại package: `npm run build`
4. DTO sẽ tự động available cho tất cả services

## Lưu ý

- Tất cả DTOs sử dụng `class-validator` decorators
- Required fields sử dụng `!` operator để tránh TypeScript strict mode errors
- Optional fields sử dụng `?` operator
- Package này được build thành CommonJS module để tương thích với NestJS

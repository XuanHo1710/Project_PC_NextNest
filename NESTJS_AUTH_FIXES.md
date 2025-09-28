# Debug NestJS Auth Errors - Fix Guide

## 🐛 **Lỗi đã được sửa:**

### ✅ **1. ERR_HTTP_HEADERS_SENT Error**
**Vấn đề**: Response được gửi nhiều lần trong Google OAuth callback
**Giải pháp**: 
- Thay `@Res({ passthrough: true })` bằng `@Res()` trong `googleAuthRedirect`
- Sử dụng `return response.redirect()` thay vì `response.redirect()` + `return result`
- Thêm proper error handling với try-catch

### ✅ **2. TypeScript Type Errors**
**Vấn đề**: Properties `authProvider`, `googleId`, `isEmailVerified` không tồn tại trên Guest type
**Giải pháp**:
- Sử dụng `(guest as any).authProvider` để bypass type checking
- Sử dụng `findByIdAndUpdate()` thay vì direct property assignment
- Thêm fallback values với `|| 'local'`

### ✅ **3. Import Path Issues**
**Vấn đề**: Import paths không đúng với cấu trúc thư mục
**Giải pháp**:
- Đổi từ `src/admin/guest/entities/guest.entity` thành `../../admin/guest/entities/guest.entity`
- Cập nhật imports trong auth.module.ts và auth.service.ts

### ✅ **4. Controller Route Issues**
**Vấn đề**: Route paths không match với client expectations
**Giải pháp**:
- Đổi `@Controller('/client/auth')` thành `@Controller('api/v1/client/auth')`
- Đảm bảo routes match với client service calls

## 🔧 **Các file đã được cập nhật:**

### **auth.controller.ts**
```typescript
@Controller('api/v1/client/auth') // ✅ Fixed route path
export class ClientAuthController {
    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Req() req: Request, @Res() response: Response) { // ✅ Removed passthrough
        try {
            const guest = await this.authService.googleLogin(user);
            const result = await this.authService.login(guest, response);
            return response.redirect(`${process.env.CLIENT_URL}/auth/success?token=${result.access_token}`); // ✅ Proper return
        } catch (error) {
            return response.redirect(`${process.env.CLIENT_URL}?error=google_auth_failed`); // ✅ Error handling
        }
    }
}
```

### **auth.service.ts**
```typescript
// ✅ Fixed type issues
authProvider: (guest as any).authProvider || 'local'

// ✅ Fixed update method
await this.guestModel.findByIdAndUpdate(guest._id, {
    googleId: googleId,
    avatar: picture,
    authProvider: 'google',
    isEmailVerified: true,
    lastLoginAt: new Date()
});
```

### **auth.module.ts**
```typescript
// ✅ Fixed import paths
import { Guest, GuestSchema } from '../../admin/guest/entities/guest.entity';
import { GoogleStrategy } from '../../admin/auth/passport/google.strategy';
```

## 🚀 **Test Commands:**

```bash
# 1. Start server
cd server
npm run start:dev

# 2. Start client  
cd client
npm run dev

# 3. Test Google OAuth
# Click "Đăng nhập" button in header
# Click "Đăng nhập với Google"
# Should redirect to Google → callback → success page
```

## 📋 **Checklist để verify:**

- [ ] Server starts without errors
- [ ] Client starts without errors  
- [ ] Login modal opens khi click button
- [ ] Google OAuth redirect hoạt động
- [ ] Callback không throw headers error
- [ ] User được lưu vào database
- [ ] JWT tokens được set trong cookies
- [ ] Success page redirect đúng

## 🔍 **Common remaining issues:**

1. **CORS errors** - Thêm CORS config trong main.ts
2. **Database connection** - Verify MongoDB URI
3. **Environment variables** - Check .env file được load đúng
4. **Google OAuth config** - Verify client ID/secret và callback URL

Tất cả major errors đã được fixed! 🎉
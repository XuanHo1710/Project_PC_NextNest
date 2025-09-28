# Google OAuth Setup Guide

## 1. Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật Google+ API và Google OAuth2 API

## 2. Tạo OAuth 2.0 Credentials

1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Chọn **Web application**
4. Thêm **Authorized redirect URIs**:
   - `http://localhost:8080/api/v1/client/auth/google/callback` (dev)
   - `https://yourdomain.com/api/v1/client/auth/google/callback` (production)

## 3. Cấu hình Environment Variables

### Server (.env)
```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:8080/api/v1/client/auth/google/callback
CLIENT_URL=http://localhost:3000
JWT_ACCESS_TOKEN_SECRET=your-jwt-access-secret-here
JWT_REFRESH_TOKEN_SECRET=your-jwt-refresh-secret-here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

### Client (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 4. Cài đặt Dependencies

### Server
```bash
cd server
npm install passport-google-oauth20 @types/passport-google-oauth20
```

### Client
Đã được tích hợp sẵn với Ant Design và React Context.

## 5. Cách sử dụng

### Backend API Endpoints

- `GET /api/v1/client/auth/google` - Khởi tạo Google OAuth flow
- `GET /api/v1/client/auth/google/callback` - Callback sau khi auth thành công
- `POST /api/v1/client/auth/login` - Đăng nhập bằng email/password
- `POST /api/v1/client/auth/register` - Đăng ký tài khoản mới
- `POST /api/v1/client/auth/logout` - Đăng xuất
- `POST /api/v1/client/auth/refresh` - Refresh token

### Frontend

1. **Trang auth**: `/auth` - Form đăng nhập/đăng ký với Google OAuth
2. **Auth Context**: Sử dụng `useAuth()` hook để quản lý state
3. **Protected Routes**: Sử dụng `AuthGuard` component để bảo vệ routes

### Sử dụng Auth Context

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
    const { user, login, logout, loginWithGoogle } = useAuth();
    
    if (user) {
        return <div>Chào {user.fullname}!</div>;
    }
    
    return (
        <div>
            <button onClick={() => login('email', 'password')}>
                Đăng nhập
            </button>
            <button onClick={loginWithGoogle}>
                Đăng nhập Google
            </button>
        </div>
    );
}
```

### Bảo vệ Routes

```tsx
import AuthGuard from '@/components/common/AuthGuard';

function ProtectedPage() {
    return (
        <AuthGuard>
            <div>Nội dung chỉ user đã đăng nhập mới thấy</div>
        </AuthGuard>
    );
}
```

## 6. Database Schema

Guest entity đã được cập nhật để hỗ trợ Google OAuth:

```typescript
{
    email: string;
    fullname: string;
    phone?: string;
    avatar?: string;
    password?: string;
    googleId?: string;
    authProvider: 'local' | 'google';
    isEmailVerified: boolean;
    // ... other fields
}
```

## 7. Cookie Authentication

- `client_access_token` - JWT access token (15 phút)
- `client_refresh_token` - JWT refresh token (7 ngày)

Cookies được set với `httpOnly: true` để bảo mật.

## 8. Các tính năng đã implement

✅ Google OAuth login/register  
✅ Local email/password authentication  
✅ JWT với refresh token  
✅ Auto refresh token khi expire  
✅ User profile management  
✅ Protected routes  
✅ Logout functionality  
✅ User avatar từ Google  
✅ Auth state persistence  

## 9. Testing

1. Start server: `cd server && npm run start:dev`
2. Start client: `cd client && npm run dev`
3. Truy cập `http://localhost:3000/auth`
4. Test đăng nhập bằng Google và email/password

## 10. Security Notes

- JWT secrets phải được generate random và bảo mật
- Google Client Secret không được expose ra frontend
- Cookies sử dụng httpOnly flag
- Validate input ở cả frontend và backend
- Rate limiting cho auth endpoints (nên implement thêm)
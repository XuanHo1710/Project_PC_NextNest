n# Hybrid Cart Implementation Guide

Đây là hướng dẫn sử dụng hệ thống Hybrid Cart đã được implement.

## 🔗 Integration trong Layout

Thêm CartProvider vào layout chính:

```tsx
// app/layout.tsx hoặc app/(client)/layout.tsx
import { CartProvider } from '@/components/providers/CartProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

## 🛒 Sử dụng trong Header

```tsx
// components/Header/Header.tsx
import { CartIcon } from '@/components/ui/CartIcon';

export default function Header() {
  return (
    <header>
      {/* Other header items */}
      <CartIcon showText={true} />
    </header>
  );
}
```

## 📱 Sử dụng Cart Hook

```tsx
// Trong component bất kỳ
import useCartStore from '@/hooks/useCart';

export default function ProductCard({ product }) {
  const { addToCart, cart, isLoading } = useCartStore();

  const handleAddToCart = async () => {
    await addToCart(product, 1);
  };

  return (
    <div>
      <Button 
        onClick={handleAddToCart}
        loading={isLoading}
        disabled={product.stock === 0}
      >
        Thêm vào giỏ hàng
      </Button>
    </div>
  );
}
```

## 🔄 Sync Cart với Auth

Cart sẽ tự động sync khi user login/logout. Nhưng bạn có thể trigger manual:

```tsx
// Khi user login thành công
const { syncCartOnLogin } = useCartStore();
await syncCartOnLogin(user.id);

// Khi user logout
const { syncCartOnLogout } = useCartStore();
await syncCartOnLogout();
```

## 🎯 Features

### ✅ Đã Implement:

1. **Hybrid Storage**: 
   - Local storage cho guest users
   - Server storage cho authenticated users
   - Auto-sync khi login/logout

2. **Real-time Updates**:
   - Optimistic updates cho UX tốt hơn
   - Error handling và rollback
   - Toast notifications

3. **Cart Components**:
   - CartIcon với badge số lượng
   - CartDrawer cho quick view
   - Full cart page với table view

4. **Persistence**:
   - Automatic save to localStorage
   - Server sync cho authenticated users
   - Merge cart items khi login

### 🔧 API Endpoints Cần Có:

```typescript
// Backend cần implement các endpoints:
GET    /api/cart/:guestId     // Get user cart
POST   /api/cart             // Create new cart
PATCH  /api/cart/:cartId     // Update cart items
DELETE /api/cart/:cartId     // Clear cart
POST   /api/cart/sync        // Sync local cart to server
```

## 📊 Cart Flow

### Guest User:
1. Thêm sản phẩm → Lưu localStorage
2. Update quantity → Update localStorage
3. Remove item → Update localStorage

### Authenticated User:
1. Load cart từ server
2. Merge với local cart (nếu có)
3. Mọi thay đổi sync với server
4. Fallback về localStorage nếu server error

### Login Flow:
1. Lấy local cart hiện tại
2. Fetch server cart
3. Merge cả hai
4. Update server với merged cart
5. Clear local cart

### Logout Flow:
1. Save current cart to localStorage
2. Reset về guest state
3. Load từ localStorage

## 🎨 UI Components

### CartIcon
- Badge hiển thị tổng số lượng items
- Click để mở CartDrawer
- Responsive design

### CartDrawer
- Quick view cart items
- Inline quantity update
- Quick remove items
- Navigation to full cart page

### CartPage
- Full table view
- Bulk operations
- Address selection
- Checkout flow

## ⚠️ Notes

1. **Error Handling**: Tất cả operations đều có error handling và rollback
2. **Performance**: Sử dụng optimistic updates cho UX mượt mà
3. **Persistence**: Cart data được persist qua sessions
4. **Security**: Server validation cho all cart operations
5. **Scalability**: Support multiple cart items và large quantities

## 🚀 Next Steps

1. Implement backend API endpoints
2. Add cart analytics tracking
3. Add cart abandonment recovery
4. Implement cart sharing features
5. Add wishlist integration
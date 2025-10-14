# Redis Cache Invalidation - Complete Checklist

## ✅ Fixed Issues

### 1. VNPay Payment Service (`vnpay.service.ts`)
**Problem**: Khi thanh toán qua VNPay thành công, không xóa cache
**Fixed**:
- ✅ Invalidate product cache (slug-based)
- ✅ Invalidate product category cache (10 pages)
- ✅ Invalidate cart cache
- ✅ Invalidate orders cache

### 2. Order Service (`order.service.ts`)
**Problem**: Khi tạo đơn hàng COD, không xóa product cache
**Fixed**:
- ✅ Invalidate product cache (slug-based)
- ✅ Invalidate product category cache
- ✅ Invalidate cart cache
- ✅ Invalidate orders cache

### 3. Guest Service (`guest.service.ts`)
**Problem**: Khi thêm/sửa/xóa địa chỉ, không xóa guest profile cache
**Fixed**:
- ✅ `addAddress()` - invalidate guest profile cache
- ✅ `updateAddress()` - invalidate guest profile cache
- ✅ `deleteAddress()` - invalidate guest profile cache
- ✅ `setDefaultAddress()` - invalidate guest profile cache

### 4. Product Service (`product.service.ts`)
**Already Working**:
- ✅ `postCommentOnProduct()` - invalidates 10 pages of comments
- ✅ `replyCommentProduct()` - invalidates 10 pages of comments
- ✅ `interactCommentProduct()` - invalidates comment cache
- ✅ `handleWishlist()` - invalidates wishlist cache

### 5. Cart Service (`cart.service.ts`)
**Already Working**:
- ✅ `update()` - invalidates cart cache

## Cache Keys Structure

```typescript
// Product caches
`product:slug:${slug}`                                              // Single product
`products:category:${categoryId}:page:${page}:sort::cpu::ram::price:`  // Category list
`products:search:${keyword}`                                        // Search results

// Guest caches
`guest:profile:${guestId}`                                         // Guest profile
`guest:cart:${guestId}`                                            // Guest cart
`guest:orders:${guestId}`                                          // Guest orders
`guest:wishlist:${guestId}`                                        // Guest wishlist

// Comment caches
`product:comments:${productId}:page:${page}`                       // Product comments
```

## Testing Checklist

### VNPay Payment Flow
1. ✅ Add items to cart
2. ✅ Go to payment page
3. ✅ Pay with VNPay
4. ✅ After success, check:
   - Cart should be empty (cache cleared)
   - Product stock should decrease (cache cleared)
   - Orders list should show new order (cache cleared)

### COD Order Flow
1. ✅ Add items to cart
2. ✅ Create COD order
3. ✅ Check:
   - Cart cleared
   - Product stock updated
   - Orders list updated

### Comment Flow
1. ✅ Post comment on product
2. ✅ Check comments appear immediately (cache cleared)
3. ✅ Reply to comment
4. ✅ Check reply appears (cache cleared)
5. ✅ Like/dislike comment
6. ✅ Check count updates (cache cleared)

### Address Management
1. ✅ Add new address
2. ✅ Check profile shows new address (cache cleared)
3. ✅ Update address
4. ✅ Check changes reflect immediately
5. ✅ Delete address
6. ✅ Check address removed from profile

### Wishlist Flow
1. ✅ Add product to wishlist
2. ✅ Check wishlist page (cache cleared)
3. ✅ Remove from wishlist
4. ✅ Check wishlist updates

## Performance Notes

- **Product cache TTL**: 1 hour (3600000ms)
- **Category list cache TTL**: 30 minutes (1800000ms)
- **Cart cache TTL**: 5 minutes (300000ms)
- **Orders cache TTL**: 10 minutes (600000ms)
- **Comments cache TTL**: 10 minutes (600000ms)
- **Guest profile cache TTL**: 1 hour (3600000ms)
- **Wishlist cache TTL**: 30 minutes (1800000ms)

## Future Improvements

1. **Pattern-based cache deletion**: Instead of deleting 10 pages manually, use Redis SCAN with pattern
2. **Cache warming**: Pre-populate common queries after invalidation
3. **Granular invalidation**: Only invalidate affected filter combinations
4. **Cache versioning**: Add version numbers to cache keys
5. **Distributed cache**: Use Redis pub/sub for multi-server cache invalidation

## Monitoring

Monitor these metrics:
- Cache hit rate per endpoint
- Cache invalidation frequency
- Stale data incidents
- Cache memory usage

## Notes

⚠️ **Important**: Category cache invalidation currently only clears the "no filter" version. If you have many filter combinations being used, you may need to implement pattern-based deletion using Redis KEYS or SCAN commands.

Example:
```typescript
// Instead of:
await this.cacheManager.del(`products:category:${categoryId}:page:1:sort::cpu::ram::price:`);

// Use pattern matching (requires redis-specific implementation):
const keys = await redis.keys(`products:category:${categoryId}:*`);
await Promise.all(keys.map(key => this.cacheManager.del(key)));
```

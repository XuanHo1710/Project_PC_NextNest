# Project PC - E-commerce Platform Copilot Instructions

## Architecture Overview
This is a full-stack TypeScript e-commerce platform with separate client (Next.js 15) and server (NestJS) applications, connected via REST APIs with hierarchical category management.

### Key Components
- **Client**: Next.js 15 app in `/client` with App Router, Ant Design, TailwindCSS, and dual layout (admin/client)
- **Server**: NestJS API in `/server` with MongoDB, JWT auth, versioned endpoints (`/api/v1/`, `/api/v2/`)
- **Data**: Hierarchical product categories with parent-child relationships stored in MongoDB

## Project Structure Patterns

### Client Architecture (`/client/src`)
- **Route Groups**: `(admin)` for admin panel, `(client)` for public store
- **Service Layer**: Centralized API calls in `services/{admin,client}/` with service classes
- **Shared Components**: `components/ui/` for reusable UI, `components/common/` for business logic
- **Config Pattern**: `config/` contains `axiosClient.tsx` (API client), `route.tsx` (path constants)

### Server Architecture (`/server/src`)
- **Module Separation**: `admin/` (protected routes), `client/` (public routes), `chatbot/` (AI features)
- **Global Setup**: `core/` contains `transform.interceptor.ts` (response formatting), `exception.filter.ts`
- **Controller Inheritance**: Admin controllers extend `AdminBaseController` for shared functionality

## Development Workflows

### Starting Development
```bash
# Terminal 1 - Server (port 8080)
cd server && npm run start:dev

# Terminal 2 - Client (port 3000)  
cd client && npm run dev
```

### API Communication Pattern
- Base URL: `http://localhost:8080/api/v1/`
- Client uses `axiosClient.tsx` with automatic error handling via toast notifications
- JWT auth with refresh tokens stored in cookies (`refresh_token`)
- Response format: `{ statusCode, message, data, timestamp }`

## Code Conventions

### Service Classes Pattern
```typescript
// Client services follow this pattern
class CategoryClientService {
    async getCategoriesPreview(): Promise<ICategoryPreview[]> {
        const response = await axios.get(`/category/preview`)
        return response.data
    }
}
export const categoryClientService = new CategoryClientService()
```

### Hierarchical Data Handling
Categories use embedded parent-child references:
```typescript
{
    _id: ObjectId,
    name: string,
    parent: { _id: ObjectId, name: string } | null,
    children: [{ _id: ObjectId, name: string }]
}
```

### Route Protection
- Middleware in `client/src/middleware.ts` protects admin routes
- Uses `pathAdminRoutes` constants from `config/route.tsx`
- Server guards are commented out but available (`JwtAuthGuard`)

## Database & Models

### MongoDB Connection
- Uses `mongoose-autopopulate` plugin for automatic relationship population
- Connection configured in `server/src/app.module.ts`
- Type definitions in `server/types/` and `client/src/types/`

### Category Management
- Admin can CRUD categories with parent-child updates
- Client gets preview via `/category/preview` endpoint
- Bulk operations supported via `updateMany` endpoints

## Key Dependencies & Tools
- **Client**: Ant Design components, React Query for state, Framer Motion for animations
- **Server**: Passport JWT, bcrypt for auth, class-validator for DTOs
- **Shared**: TypeScript strict mode, ESLint configurations

## Development Notes
- Use service classes for API calls, not inline axios
- Admin routes start with `/admin/` prefix
- Category updates cascade to parent-child relationships automatically
- Toast notifications handled globally via axios interceptors
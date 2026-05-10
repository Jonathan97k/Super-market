# Website Issues Log

## Security Vulnerabilities
- [x] **SQL Injection in ProductService**: Filters are constructed using string interpolation in `services/products.ts`.
- [x] **SQL Injection in CategoryService**: Filters are constructed using string interpolation in `services/categories.ts`.
- [x] **SQL Injection in OrderService**: Filters are constructed using string interpolation in `services/orders.ts`.
- [x] **SQL Injection in PromotionService**: Filters are constructed using string interpolation in `services/promotions.ts`.

## Architecture & Reliability
- [x] **Inconsistent Client Initialization**: Multiple PocketBase client instances are created across `lib/pocketbase/client.ts`, `lib/pocketbase/server.ts`, and `lib/auth.ts`, leading to potential session conflicts and connection leaks.
- [x] **Unsafe Type Casting**: Frequent use of `as any` and `as Product[]` in services without validation, risking runtime crashes on unexpected database responses.
- [x] **Silent Error Handling**: Many services catch errors and return empty values or logs, which prevents proper error reporting in the UI.

## Potential Logic Errors
- [ ] **Promotion Cache**: The cache in `PromotionService` is a simple `Map` and might not be synchronized across different server instances if deployed in a clustered environment.
- [ ] **Auth Session Sync**: Potential mismatch between client-side `authStore` and server-side cookie management in `lib/auth.ts`.

Plan
План Підготовки Фронту До Backend API
Summary
Цільовий контракт: майбутній develop після merge PR #25 / PLIS-477.
Готуємо фронт під JWT auth, numeric backend IDs, server products/favorites/callbacks/cart/orders.
Анонімний кошик лишається локально; після логіну робимо POST /api/cart/merge.
До merge PR #25 можна безпечно робити auth/API-архітектуру, products/favorites/callbacks; cart/orders підключати після появи в develop.
Key Changes
Створити центральний API client:
VITE_API_URL;
Authorization: Bearer <accessToken>;
Device-Id;
refresh on 401 через /api/auth/refresh;
один retry оригінального запиту після refresh;
logout/clear tokens, якщо refresh failed.
Auth:
login зберігає accessToken, refreshToken, deviceId;
user вантажиться через /api/users/me;
роль береться з JWT claim roles: ADMIN -> admin, інакше user;
прибрати залежність від cookie endpoints типу /api/auth/status.
Data/API шар:
рознести API по модулях: auth/profile, products/categories, favorites, callbacks, cart, orders, media, reviews/content/settings.
нормалізувати backend DTO в UI-моделі, щоб компоненти не знали про s3Key, PageResponse, backend naming.
перейти з string product ids на backend numeric productId; routes лишити /products/:id.
Media:
для s3Key робити POST /api/files/presign/download;
кешувати download URL в памʼяті до expiresAt;
мати fallback image, якщо presign/media не доступні.
Products/catalog:
GET /api/categories;
GET /api/products з categoryIds, page, size, sort;
GET /api/products/{id};
GET /api/products/{id}/related;
price sort підготувати як price,asc/desc, але вмикати тільки коли бек додасть підтримку.
Favorites:
GET /api/users/me/favorites;
POST/DELETE /api/users/me/favorites/{productId};
якщо user не залогінений, показувати login modal, як зараз.
Callback:
POST /api/callback тільки для auth user;
payload: { name, phone, message };
account requests: GET /api/users/me/callback-requests;
замінити фронтове description на message.
Cart/orders після merge PR #25:
guest cart: localStorage;
після login: POST /api/cart/merge з локальними items, потім чистимо guest cart і використовуємо server cart;
auth cart: GET /api/cart, POST /api/cart/items, PUT /api/cart/items/{productId}, DELETE;
checkout: POST /api/orders з Idempotency-Key;
order history: GET /api/users/me/orders.
Implementation Order
API foundation: client, token storage, JWT decode, device id, error handling.
Auth/profile: login/logout/register/reset/verify/users-me/settings forms.
Public data: products/categories/product detail/related/reviews/content/settings + media resolver.
Favorites/callbacks/account requests.
Cart architecture: split guest cart and auth server cart; add merge-on-login hook.
Orders after PR #25 lands in develop: checkout, order success, account order history.
Test Plan
npm run build after each major stage.
Manual auth scenarios:
login -> /users/me -> role from JWT;
expired token -> refresh -> retry;
refresh failure -> logout state.
Manual shop scenarios:
guest adds cart items;
login triggers cart merge;
auth user updates/removes cart items;
checkout sends Idempotency-Key and clears cart after success.
Manual API scenarios:
catalog pagination/filter/sort;
favorites add/remove/load;
callback requires login and appears in account requests.
Regression check:
usual mode still hides ordering UI;
order mode shows prices/cart;
product detail, favorites page, account page, contact form remain responsive.
Assumptions
We target develop after PR #25 is merged.
Token storage uses localStorage, because backend confirmed frontend stores tokens itself.
Role source is JWT roles, not /users/me.
Callback remains auth-only.
Price sort will be added by backend; until then frontend keeps UI ready but must not send unsupported sort to current develop.

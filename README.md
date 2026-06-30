# Frontend Plishka

## Запуск проєкту

Використовуйте версію Node.js, зазначену у `.nvmrc`:

```bash
nvm use
npm install
npm run dev
```

## API бекенду

Скопіюйте `.env.example` у `.env.local` та задайте `VITE_API_URL` як **origin** API (без `/api`).
Для локального Spring Boot це `http://localhost:8080`.

Бекенд має дозволити origin фронтенду через `CORS_ALLOWED_ORIGINS`, наприклад:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.example
```

Проєкт використовує Node.js `22.22.2`. Node.js 24 може порушити роботу нативних залежностей Vite/Rolldown на macOS.

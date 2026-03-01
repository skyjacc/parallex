# План действий: деплой + аудит безопасности

## Часть 1. Деплой и база данных (сделано / что сделать)

### 1.1 Уже сделано в репозитории

- **PostgreSQL**: в `prisma/schema.prisma` провайдер заменён на `postgresql`, `url = env("DATABASE_URL")`.
- **Миграция**: добавлена начальная миграция `prisma/migrations/20260301000000_init_postgres/migration.sql` для чистой БД.
- **Запуск в контейнере**: в `package.json` скрипт `start` заменён на `node .next/standalone/server.js` (корректно для `output: "standalone"`).
- **Скрипты БД**:
  - `db:migrate:deploy` — применить миграции в production.
  - `db:reset` — сброс БД и повторное применение миграций (осторожно: удаляет данные).
  - `deploy:db` — миграции + seed (админ + тестовый пользователь + товары + способы оплаты).
- **Middleware**: убран захардкоженный фоллбэк для `NEXTAUTH_SECRET`; при отсутствии секрета — редирект на `/auth/error?error=ConfigurationError`.
- **Security headers** в `next.config.ts`: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

### 1.2 Переменные окружения в контейнере / сервере

В `.env` или в настройках деплоя (Railway, Docker, etc.) должны быть:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@ballast.proxy.rlwy.net:44111/railway"
NEXTAUTH_SECRET="<длинный случайный секрет>"
NEXTAUTH_URL="https://shop.parallax.cards"
MONEYMOTION_API_KEY="..."
MONEYMOTION_WEBHOOK_SECRET="..."
PRX_PER_USD=100
```

- **Важно**: в production не коммитить `.env` и не подставлять реальные пароли в репозиторий.

### 1.3 Чистая БД перед деплоем (варианты)

**Вариант A — полный сброс и повторное применение миграций**

```bash
# Локально или в CI, при подключённой production DATABASE_URL
npm run db:reset
# Затем при необходимости seed:
npm run db:seed
```

**Вариант B — только применить миграции (таблицы создаются, данные не трогаются)**

```bash
npm run db:migrate:deploy
```

**Вариант C — первый деплой: миграции + начальные данные**

```bash
npm run deploy:db
```

### 1.4 Запуск в Docker (пример)

```dockerfile
FROM node:22-alpine AS base
RUN corepack enable && pnpm install -g pnpm
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.json* ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# DATABASE_URL нужен для prisma generate (можно заглушка на build time)
ARG DATABASE_URL
ENV DATABASE_URL="${DATABASE_URL}"
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
# Миграции лучше запускать отдельным job/step до старта приложения
CMD ["node", "server.js"]
```

Перед первым запуском контейнера один раз выполнить миграции (отдельная команда или entrypoint):

```bash
npx prisma migrate deploy
# при необходимости: npm run db:seed
```

---

## Часть 2. Чеклист по аудиту безопасности

### Критические (сделать в первую очередь)

| # | Пункт аудита | Статус | Действие |
|---|----------------|--------|----------|
| 1 | Убрать захардкоженный JWT-секрет в middleware | ✅ Сделано | Используется только `process.env.NEXTAUTH_SECRET`, при отсутствии — редирект на error |
| 2 | Rate limiting на auth и чувствительные API | ⬜ Не сделано | Добавить лимиты на `POST /api/auth/register`, `POST /api/auth/[...nextauth]`, `POST /api/topup`, `POST /api/products/[id]/buy` |
| 3 | Seed-пароли не в production | ⬜ Не сделано | Не запускать `db:seed` в production с дефолтными паролями или сменить пароли после первого входа |

### Высокий приоритет

| # | Пункт аудита | Статус | Действие |
|---|----------------|--------|----------|
| 4 | Проверка баланса при рефанде в webhook | ⬜ Не сделано | В `app/api/webhook/route.ts` (и webhooks/moneymotion) перед `decrement` проверить `user.prxBalance >= transaction.amountPrx` |
| 5 | Верхняя граница для `prxAmount` (topup) | ⬜ Не сделано | В `app/api/topup/route.ts` добавить `prxAmount <= MAX_PRX` (например 1_000_000) и проверку `Number.isFinite(prxAmount)` |
| 6 | Security headers | ✅ Сделано | Добавлены в next.config.ts |
| 7 | Float → Decimal/Int для денег | ⬜ Не сделано | Долгосрочно: перевести `prxBalance`, `pricePrx`, `costPrx`, `amountPrx` на Int (в минимальных единицах) или Prisma Decimal |

### Средний приоритет

| # | Пункт аудита | Статус | Действие |
|---|----------------|--------|----------|
| 8 | Валидация callbackUrl (open redirect) | ⬜ Не сделано | В `app/auth/signin/page.tsx` разрешать только относительные пути: `/^\\//.test(callbackUrl) ? callbackUrl : "/"` |
| 9 | Пагинация на списках | ⬜ Не сделано | Добавить `take`/`skip` или cursor в GET /api/products, /api/orders, /api/admin/* |
| 10 | Криптостойкий moneymotionId | ⬜ Не сделано | В topup заменить на `crypto.randomUUID()` или `crypto.randomBytes(16).toString('hex')` |
| 11 | User enumeration | ⬜ Не сделано | Унифицировать сообщения при регистрации и логине («Invalid credentials» вместо «email exists» / «username taken») |

### Низкий приоритет

| # | Пункт аудита | Статус | Действие |
|---|----------------|--------|----------|
| 12 | Обновление баланса в JWT | ⬜ Не сделано | По желанию: обновлять JWT/session после покупки/топ-апа (или чаще подтягивать баланс с API) |
| 13 | Инвалидация JWT при logout | ⬜ Не сделано | Опционально: blacklist токенов в Redis и проверка в middleware |
| 14 | Email-верификация | ⬜ Не сделано | Отдельная фича |

### Дополнительно (код и инфраструктура)

| # | Пункт | Действие |
|---|--------|----------|
| 15 | Дубликат webhook | Удалить один из `app/api/webhook/route.ts` или `app/api/webhooks/moneymotion/route.ts`, оставить один маршрут и использовать его в настройках MoneyMotion |
| 16 | Кнопка "Continue with Google" | Либо реализовать Google Provider в NextAuth, либо убрать кнопку с signin/signup |
| 17 | Mock-данные в админке | Подключить GET /api/admin/stats и реальные данные на странице admin |
| 18 | Тесты | Добавить unit/e2e тесты (Jest/Vitest + Playwright) |

---

## Часть 3. Порядок действий перед следующим деплоем

1. **БД**: в Railway (или где крутится Postgres) задать `DATABASE_URL`. Убедиться, что БД пустая или можно сбросить.
2. **Локально** (с `DATABASE_URL` на Railway):
   - `npm run db:migrate:deploy` — применить миграции.
   - При первом деплое: `npm run db:seed` (создаст админа и тестовые данные). В production потом сменить пароль админа.
3. **Контейнер**:
   - В образе/сервере задать все переменные из п. 1.2.
   - Сборка: `npm run build` (уже включает `prisma generate`).
   - Запуск: `npm run start` (теперь это `node .next/standalone/server.js`).
   - Миграции в production лучше выполнять отдельным шагом до старта приложения: `npx prisma migrate deploy`.
4. **После деплоя**: сменить пароль админа (seed: admin@parallax.gg / admin123), проверить вход и работу оплаты.

После этого можно по очереди закрывать пункты из Части 2 (rate limiting, webhook refund check, topup max, callbackUrl, пагинация и т.д.).

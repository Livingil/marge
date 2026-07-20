# Production Deploy (marge, no domains)

Серверные параметры:
- SSH host: `176.97.97.114`
- SSH port: `50022`
- SSH user: `vladimir`
- Remote dir: `/home/vladimir/marge`

Стек настроен в портовом режиме, без Caddy и без 80/443.
Публичный порт frontend: `18080`.

## 1. Подготовка env

```powershell
Copy-Item .env.prod.example .env
Copy-Item deploy/backend.env.example deploy/backend.env
```

Заполни секреты в `deploy/backend.env`.

## 2. Синхронизация тегов образов

```powershell
npm run version:sync
```

## 3. Публикация Docker-образов

```powershell
npm run images:publish -- -FrontendApiUrl http://176.97.97.114:18080
```

## 4. Деплой на сервер

```powershell
npm run deploy:remote
```

Только backend или frontend:

```powershell
npm run deploy:remote -- -Services backend
npm run deploy:remote -- -Services frontend
```

## 5. Проверка

- `http://176.97.97.114:18080`
- `http://176.97.97.114:18080/health` -> `{ ok: true, version: "..." }`

## GitLab CI frontend deploy

В репозитории есть ручной GitLab pipeline для доставки только frontend-приложения.
Job `deploy:frontend` запускается вручную на default branch, обновляет только `FRONTEND_IMAGE`
в удаленном `.env` и выполняет `docker compose up -d --no-deps frontend`.

Если Caddy уже установлен на сервере отдельно, CI его не трогает. В этой схеме frontend
остается доступен на внутреннем/публичном `APP_PORT`, а Caddy продолжает проксировать HTTPS
на этот порт.

Если новый frontend не проходит health-check по `APP_PORT`, pipeline возвращает старое значение
`FRONTEND_IMAGE` и заново поднимает предыдущий frontend-образ.

Добавь в GitLab CI/CD Variables:

- `DOCKER_REGISTRY` - например `docker.io`
- `DOCKER_REGISTRY_USER`
- `DOCKER_REGISTRY_PASSWORD`
- `SSH_HOST` - например `176.97.97.114`
- `SSH_USER` - например `vladimir`
- `SSH_PORT` - например `50022`
- `SSH_PRIVATE_KEY`
- `VITE_API_URL` - публичный URL backend API для сборки frontend
- `PUBLIC_APP_URL` - опционально, HTTPS URL приложения для проверки через Caddy

Секреты должны быть masked/protected variables в GitLab, не в файлах репозитория.

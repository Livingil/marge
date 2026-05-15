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

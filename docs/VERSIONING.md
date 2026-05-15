# Versioning

В проекте используется независимое версионирование backend и frontend.

## Источники версий

- Backend version: `backend/package.json` -> `version`
- Frontend version: `frontend/package.json` -> `version`

## Где версия используется

- Docker tag backend: `livingil/marge-backend:<version>`
- Docker tag frontend: `livingil/marge-frontend:<version>`
- Backend runtime: `APP_VERSION` (в `/health`)
- Frontend runtime: `VITE_APP_VERSION` (публикуется в `window.__APP_VERSION__`)

## Команды

- `npm run version:sync` — синхронизировать image tags в `.env`
- `npm run images:publish` — собрать и запушить образы
- `npm run deploy:remote` — выкатить на сервер

## Релизный порядок

1. Поднять `version` в `backend/package.json` и/или `frontend/package.json`.
2. Выполнить `npm run version:sync`.
3. Выполнить `npm run images:publish -- -FrontendApiUrl <prod-api-url>`.
4. Выполнить `npm run deploy:remote`.

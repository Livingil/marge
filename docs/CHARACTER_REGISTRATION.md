# Character Registration

## Что добавлено

- В профиль пользователя добавлен блок `character`.
- Добавлены endpoint'ы:
  - `POST /character/register`
  - `PATCH /character/profile`
- `GET /user` теперь возвращает поле `character`.

## Формат `character` в `GET /user`

```json
{
  "character": {
    "isRegistered": true,
    "name": "Альфа",
    "codename": "ALPHA-01",
    "archetype": "engineer",
    "avatarSeed": "seed-v1",
    "registeredAt": "2026-05-14T12:00:00.000Z",
    "updatedAt": "2026-05-14T12:00:00.000Z"
  }
}
```

## POST /character/register

Создаёт/подтверждает регистрацию персонажа для текущего `x-player-id`.

Body:

```json
{
  "name": "Имя персонажа",
  "codename": "Позывной",
  "archetype": "alchemist",
  "avatarSeed": "seed-v1"
}
```

Правила:

- `name`: 2..24 символа.
- `codename`: опционально, 2..24 символа.
- Допустимые `archetype`: `alchemist | engineer | scout | keeper`.
- `avatarSeed`: опционально, до 64 символов.

## PATCH /character/profile

Обновляет существующий профиль персонажа.

Body (любые поля опциональны):

```json
{
  "name": "Новое имя",
  "codename": "Новый позывной",
  "archetype": "scout",
  "avatarSeed": "seed-v2"
}
```

Если персонаж ещё не зарегистрирован, endpoint вернёт ошибку.

## Frontend API hooks

- `useRegisterCharacterMutation`
- `useUpdateCharacterProfileMutation`

Оба находятся в:

- `frontend/src/shared/api/gameApi.ts`

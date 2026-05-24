# Couragegang UI (monorepo)

Кросс-платформенный фронт: **React (web)** + **React Native (mobile)** с общими пакетами.

## Структура

```text
ui/
  apps/
    web/          @couragegang/web     — Vite + React (бывший web-ui)
    mobile/       @couragegang/mobile  — Expo + React Native
  packages/
    api-client/   @couragegang/api-client   — HTTP + OpenAPI (bff)
    shared/       @couragegang/shared       — хуки, типы, AuthStorage
    design-system/ @couragegang/design-system — токены + RN-компоненты (web через react-native-web)
```

## Требования

- Node 20+ (в проекте `.nvmrc` → 22; на Windows: `nvm use 22`)
- [pnpm](https://pnpm.io) 9+ (`corepack enable` или `npx pnpm@9.15.0`)

## Команды

```bash
cd ui
pnpm install
pnpm generate:api    # openapi-typescript из services/api-contracts/bff/openapi.yaml
pnpm dev:web
pnpm dev:mobile
```

## CI/CD (path filters)

| Workflow | Когда | Действие |
|----------|--------|----------|
| `ci-web.yml` | изменения `apps/web/`, `packages/`, lockfile | `pnpm` build web |
| `ci-mobile.yml` | изменения `apps/mobile/`, `packages/`, lockfile | `tsc --noEmit` mobile |
| `deploy-web.yml` | push `test`/`main` + web paths | platform `deploy-web-ui.yml` → rsync VPS |

Изменения только в `apps/mobile/` **не** деплоят web на VPS.

## OpenAPI

Источник правды: `services/api-contracts/bff/openapi.yaml`.

После изменения контракта:

```bash
pnpm generate:api
```

Расширяйте `createBffApi` в `packages/api-client` или переносите методы на `createBffOpenApiClient` (openapi-fetch).

## Web

- API base: `VITE_API_BASE` (default `/api`, proxy → BFF :8082)
- Общий auth: `packages/shared` + `apps/web/src/platform/`

## Mobile

- API base: `EXPO_PUBLIC_API_BASE`
- Токены: `expo-secure-store` (`apps/mobile/src/platform/storage.ts`)

## Старый `web-ui/`

Каталог `ui/web-ui` — предыдущий standalone-клон; разработка ведётся в **`apps/web`**. Git remote перенесите на корень `ui/` при необходимости.

## Публикация (опционально)

Сейчас пакеты `workspace:*`. Для отдельных git-репозиториев позже можно вынести `packages/*` в npm/GitHub Packages без изменения импортов в apps.

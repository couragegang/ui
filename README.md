# Courage Gang — Web UI (клиентский SPA)

React + TypeScript + Vite. Единая точка API — BFF **`/api/*`** (nginx на VPS проксирует в `bff-gateway`).

## Локальная разработка

```bash
npm install
npm run dev
```

Vite proxy: `/api` → `http://localhost:8082/v1/bff` (нужен поднятый BFF).

## Сборка

```bash
npm ci
npm run build   # → dist/
```

## Git и деплой (как BC)

| Ветка | Деплой |
|-------|--------|
| **`test`** | staging `https://ai-test.valoriel.ru` |
| **`main`** | prod `https://ai.valoriel.ru` |

Push в `test` / `main` → **`trigger-deploy.yml`** → reusable **`platform/deploy-web-ui.yml`** → rsync на VPS.

Секреты **`VPS_*`** — GitHub Environments **`test`** / **`prod`** в **platform** (как у `deploy-vps`). Checkout private web-ui — через `CALLER_ACCESS_TOKEN` (GITHUB_TOKEN web-ui).

Ручной деплой: `../platform/scripts/deploy-web-ui.sh test|prod user@vps`.

## CI

- **`ci.yml`** — build на PR/push в `test`/`main`
- **`trigger-deploy.yml`** — `workflow_call` → platform **`deploy-web-ui.yml`**

Сценарии UI: [`../cursor-context/docs/ui-api-scenarios.md`](../cursor-context/docs/ui-api-scenarios.md) (K1–K8).

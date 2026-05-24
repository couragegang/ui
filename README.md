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

Push в `test` / `main` → workflow **`trigger-deploy.yml`** → reusable **`couragegang/platform`** → **`deploy-web-ui.yml`** → `rsync dist/` на VPS.

Секреты **`VPS_HOST`**, **`VPS_USER`**, **`VPS_SSH_KEY`** — GitHub Environments **`test`** / **`prod`** в репозитории **platform** (те же, что для `deploy-vps`).

Ручной деплой: `../platform/scripts/deploy-web-ui.sh test|prod user@vps`.

## CI

- **`ci.yml`** — lint + build на PR/push в `test`/`main`
- **`trigger-deploy.yml`** — выкладка после merge

Сценарии UI: [`../cursor-context/docs/ui-api-scenarios.md`](../cursor-context/docs/ui-api-scenarios.md) (K1–K8).

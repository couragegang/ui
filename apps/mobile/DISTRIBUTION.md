# Установка на телефон без ПК (EAS Build)

**Expo Go** всегда тянет JS с Metro на компьютере — для автономной работы нужна **сборка в облаке** (EAS). JS и нативный код упаковываются в APK/IPA; API — `https://ai-test.valoriel.ru/api`, сессия — SecureStore на устройстве.

## Один раз (с любого компьютера)

```bash
cd ui/apps/mobile
npm i -g eas-cli   # или: npx eas-cli
eas login
eas init           # привяжет проект к expo.dev, допишет projectId в app.json
```

Для **iOS (TestFlight)** нужен [Apple Developer Program](https://developer.apple.com/programs/) (~$99/год).  
Для **Android (APK по ссылке)** достаточно аккаунта Expo — Apple не нужен.

## Сборка

Из корня монорепо `ui/` (важно для pnpm workspace):

```bash
cd ui
pnpm build:mobile:preview:android   # APK — проще всего
# или
pnpm build:mobile:preview:ios       # internal / TestFlight после submit
```

Либо из `ui/apps/mobile`:

```bash
pnpm build:preview:android
pnpm build:preview:ios
```

Дождитесь окончания на [expo.dev](https://expo.dev) → **Builds** → скачайте артефакт или откройте QR.

## Установка на телефон

| Платформа | Профиль `preview` | Как поставить |
|-----------|-------------------|---------------|
| **Android** | APK | Ссылка с expo.dev → скачать APK → разрешить установку из неизвестных источников |
| **iOS** | internal | TestFlight после `eas submit`, либо зарегистрировать UDID в Apple Developer (ad hoc) |

Продакшен в сторах:

```bash
cd ui/apps/mobile
pnpm build:production:ios
pnpm submit:ios
```

В App Store Connect → **TestFlight** добавьте себя тестером.

## После установки

1. Откройте приложение **без** `expo start` на ПК.
2. Войдите один раз — токены сохранятся (SecureStore).
3. Нужен интернет до staging API; локальный BFF не требуется.

## Обновления

Новая версия — снова `eas build` (с ПК или CI). Опционально позже: `expo-updates` (OTA без стора).

## Переменные

`EXPO_PUBLIC_API_BASE` задаётся в `eas.json` (профили `preview` / `production`). Другой backend — измените там и пересоберите.

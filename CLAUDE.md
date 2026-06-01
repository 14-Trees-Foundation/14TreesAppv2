# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

React Native 0.73 mobile app for 14Trees field staff. Supports offline-first tree planting data entry with background sync to the backend API. Two build flavors: `prod` (api.14trees.org) and `dev` (dev-api.14trees.org).

## Commands

```bash
yarn start          # Start Metro bundler
yarn android        # Build and run on Android
yarn ios            # Build and run on iOS
yarn lint           # ESLint
yarn test           # Jest

# Android-specific
cd android && ./gradlew assembleDevDebug    # Dev debug APK
cd android && ./gradlew assembleProdRelease # Prod release APK
```

**Requirements**: Java 17, Gradle 8.0.2, AGP 8.1.1 (see BUILD_FIX_SUMMARY.md for why this was upgraded).

**Environment**: Configured via `.env.development` / `.env.production` using `react-native-config`. Key vars: `ENV`, `APP_VERSION`, `API_HOST`.

## Architecture

### Two Database Systems (SQLite)

The app has two parallel SQLite databases — be aware of which one a feature uses:

**Legacy (`new_tree.db`)** — `src/services/tree_db.js` + `src/services/Utils.js`
- Used for shift-based tree planting (the original workflow)
- Tables: tree, plot, saplings, localShifts, newImageTable, logs_table

**Modern (`14trees.db`)** — `src/services/db/dao.ts` and `src/services/db/*.ts`
- `DaoClient` is the entry point (factory for all DAOs)
- Tables: trees, users, plots, sites, visits, visit_images, tree_snapshots, sync_info
- Each DAO has `createTable()`, CRUD methods, and sync tracking columns (`synced`, `created_at`, `updated_at`, `is_deleted`)

### API Layer

**Legacy** — `src/services/DataService.js` (axios, endpoints under `/api/appv2`)

**Modern** — `src/services/api/api.ts` (`ApiClient` class with per-resource service modules)

Authentication: `x-access-token` header. Token stored in `AsyncStorage`.

### Sync System (`src/services/sync/`)

`sync.ts` orchestrates all sync:
1. **Download phase**: Fetches delta changes (hash-based — only re-syncs if server hash changed) for trees, plots, sites, users, visits, snapshots
2. **Upload phase**: Uploads local unsynced records (trees, images, visit images, snapshots)

`SyncInfoDao` tracks per-table `synced_at` timestamps. `AsyncStorage` stores last-known hashes per entity type.

### State Management

React Context only — no Redux. `GlobalContext` (`src/context/GlobalContext.js`) holds shift state, sync progress, theme, language. Persisted state lives in `AsyncStorage`.

### Navigation

Stack + Drawer navigators (React Navigation 6). Role-based screen visibility in `DrawerNavigator.js` — admins see additional screens (Users, Reports, Dev).

### Key Flows

- **Auth**: Phone auto-detect + 4-digit PIN → POST `/api/appv2/login` → token in AsyncStorage
- **Shift workflow**: Create shift → scan/add trees → add images → update plots → sync
- **Sync**: `src/screens/Sync.tsx` (UI) calls `src/services/sync/sync.ts` (logic)
- **Localization**: English + Marathi via `react-native-localization` in `src/services/Strings.js`

### Error Handling

Global JS exception handler (`react-native-exception-handler`) writes to `logs_table` in SQLite. Logs are uploaded to `/api/appv2/uploadLogs` during sync.

## File Organization

```
src/
├── App.js                  # Root: navigation setup, auth check, permissions
├── components/             # Reusable UI components (~50+)
├── screens/                # Screen components (~30)
├── services/
│   ├── Utils.js            # 600+ LOC: DB init, permissions, helpers
│   ├── DataService.js      # Legacy API calls
│   ├── Strings.js          # i18n strings (EN + MR)
│   ├── api/                # Modern TypeScript API clients
│   ├── db/                 # Modern TypeScript DAOs (14trees.db)
│   └── sync/               # Sync orchestration
├── context/                # GlobalContext, LangContext
├── model/                  # TypeScript type definitions
└── constants/constants.ts  # API_HOST, APP_VERSION, AsyncStorage key names
```

# 14Trees Mobile App — Repo Overview

- **Platform**: React Native (0.73), TypeScript + JavaScript mixed
- **State/Navigation**: React Navigation Drawer/Stack
- **Local DB**: react-native-sqlite-storage; DAO pattern under `src/services/db`
- **Sync**: Pull/push services under `src/services/sync`; API under `src/services/api`
- **Key screens**: Trees, Visits, Plots, Sites, Users, Sync, Reports
- **Entry**: `index.js` → `src/App.js`
- **Theming/Context**: `src/context/GlobalContext .js`
- **Assets**: `assets/`

## Data model
- Types in `src/model/*.ts` (e.g., `tree.ts`, `plot.ts`)
- Change tracking fields: `is_uploaded`, `change_type`, timestamps

## DB (DAO)
- Central `DaoClient` in `src/services/db/dao.ts`
- Individual DAOs per entity (tables created on first use)

## API
- `src/services/api/api.ts` wraps axios
- Per-entity API files

## Sync Flow
1. `uploadLocalData(changesCount, syncTime)` uploads entities with pending changes
2. `fetchDeltaChanges(setProgress)` pulls latest deltas by site
3. Logs/errors tracked via `Utils`

## Build & Run
- Android: `npm run android` (installs ProdDebug via Gradle)
- iOS: `npm run ios`
- Start packager: `npm start`
- Tests: `npm test`

## Conventions
- Add new entity by creating model, DAO, API, sync service, screen, and drawer wiring
- Use `Utils.saveErrorLog`/`logException` around network/DB
- Prefer upsert patterns and `CREATE TABLE IF NOT EXISTS`

## Notable paths
- `src/components/DrawerNavigator.js` — register screens
- `src/services/sync/sync.ts` — orchestrates end-to-end sync
- `src/services/Strings.js` — localized labels
# Add a New Entity (Mobile + Sync) — Quick Guide

Follow these steps to add a new entity that has its own screen and syncs with the backend.

## 1) Define the data model
1. Create types in `src/model/<entity>.ts`.
2. Include base fields: `local_id`, `id|null`, `is_uploaded (0|1)`, `change_type ('none'|'add'|'edit'|'delete')`, timestamps.

## 2) Local DB (DAO)
1. Add DAO file: `src/services/db/<entity>.ts` with:
   - Table create SQL (include change tracking fields).
   - CRUD + helpers (get by id/local_id, list by site/plot if applicable).
2. Register in `src/services/db/dao.ts` constructor as a property.

## 3) API layer
1. Create `src/services/api/<entity>.ts` with functions like:
   - `listDelta(siteId?)` (server → device)
   - `create|update|delete` (device → server)
2. Use `ApiClient` in `src/services/api/api.ts` to wire exports.

## 4) Sync services
1. Create `src/services/sync/<entity>.ts` with:
   - Fetch: `fetchAndStore<Entity>(siteId?)`
     - Call API `listDelta`
     - Upsert into DAO
     - Mark deletions
   - Upload: `upload<Entity>Data(syncTime)`
     - Read local records where `change_type != 'none'`
     - Call API create/update/delete
     - Update local rows (`is_uploaded=1`, `change_type='none'`, set remote `id` if new)
2. If single-item upload is needed, add `uploadSingle<Entity>Data(...)`.
3. Add to `src/services/sync/sync.ts`:
   - In `fetchDeltaChanges(...)` add `await fetchAndStore<Entity>(siteId)` with a progress bump.
   - In `uploadLocalData(...)` compute changes count for the new entity and call `await upload<Entity>Data(syncTime)` when count > 0.

## 5) Strings and constants
1. Add screen/menu labels in `src/services/Strings.js`.
2. Add any constants in `src/constants/constants.ts` if needed.

## 6) Screen and navigation
1. Create a screen: `src/screens/<Entity>.tsx` (list + FAB/add/edit; use DAO for local state).
2. Add to drawer in `src/components/DrawerNavigator.js` with localized title and header actions.
3. Reuse components (filters, cards, modals) or create under `src/components/<entity>/`.

## 7) Forms and validation
1. Build a form for add/edit that writes to DAO.
2. On create/edit/delete, set `change_type` accordingly and `is_uploaded=0`.

## 8) Permissions and context
1. If feature-gated, wire flags in `src/context/GlobalContext .js`.
2. Request device permissions (camera/location) in `src/services/check_permissions.js` if required.

## 9) Testing the flow
1. Seed a few records locally → verify list renders.
2. Trigger full sync from Sync screen → verify upload then fetch.
3. Confirm server IDs are stored locally and `change_type` resets to `none`.
4. Test offline create/edit/delete → sync later.

## 10) Error handling & logs
1. Wrap API/DB calls with try/catch and use `Utils.saveErrorLog` / `Utils.logException`.
2. Ensure errors don’t block other entities’ sync.

## 11) Migration
1. If DB schema changes, ensure table `CREATE TABLE IF NOT EXISTS` covers new fields or add a migration path.
2. Bump app version if needed.

## Minimal checklist
- Model types
- DAO + registration
- API endpoints
- Sync fetch/upload
- Drawer screen
- Strings/labels
- Change tracking flags
- Error handling
- Tested online/offline sync
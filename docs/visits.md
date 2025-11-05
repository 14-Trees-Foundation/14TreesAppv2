# Visits (Mobile App)

This document explains how the Visits section works in the mobile app: UI flow, local storage, sync mechanics, and API interactions. It also highlights current limitations and extension points.

## Overview
- **Purpose**: Display site visits, view details, attach visit images, and add trees under a visit.
- **Offline-first**: Data is stored in a local SQLite DB and synchronized with the backend.
- **Pagination & Search**: List is paginated (10 at a time) and supports search by visit name.

## Key Files
- **Screen**: `src/screens/Visits.tsx`
- **Components**:
  - `src/components/visit/VisitCard.tsx`
  - `src/components/visit/VisitInfo.tsx`
  - `src/components/visit/VisitForm.tsx`
- **Model**: `src/model/visits.ts`
- **Local DB (DAO)**: `src/services/db/visits.ts`
- **Sync logic**: `src/services/sync/visits.ts`
- **API client**: `src/services/api/visits.ts`

## UI and User Flow
1. **List** (Visits.tsx)
   - Loads visits from local DB in pages of 10 (`DaoClient.visits.getVisits(offset, limit)`).
   - Infinite scroll triggers `onEndReached` to load the next page.
   - Search bar filters visits by `visit_name` using `DaoClient.visits.searchVisits('%query%')`.
   - Duplicates in the list are filtered by `local_id`.

2. **Card actions** (VisitCard)
   - **Add Tree**: Opens tree creation form linked to the selected visit.
   - **Add Visit Images**: Opens VisitForm in "edit" mode to attach images.

3. **Info modal** (VisitInfo)
   - Shows visit metadata and count of attached images (queried from local DB).
   - Provides an Edit action (opens VisitForm) and Close.

4. **VisitForm**
   - Displays visit fields and images.
   - In current UI:
     - Fields (`visit_name`, `visit_type`, `visit_date`) are shown but disabled.
     - "Edit" flow supports attaching images; metadata update is not active.
   - On submit in edit mode, new images are collected and stored locally via `visitImages.insertVisitImages`.

Note: UI code for adding new visits is present but the Floating Add button is commented out in `Visits.tsx`. Enabling creation requires restoring that button and allowing fields to be editable in `VisitForm`.

## Data Model
```ts
// src/model/visits.ts
export type Visit = {
  local_id: number,
  id?: number,
  visit_name: string,
  visit_date: string,
  site_id: number | null,
  visit_type: string,
  is_uploaded: 0 | 1,
  change_type: 'none' | 'add' | 'edit' | 'delete',
  created_at: string,
  updated_at: string
}

export type CreateVisitRequest = {
  visit_name: string,
  visit_date: string,
  site_id: number | null,
  visit_type: string,
}
```

## Local Database
- **Table**: `visits` (`src/services/db/visits.ts`)
  - Fields include `local_id`, optional live `id`, metadata, `is_uploaded`, `change_type`.
  - `change_type` tracks local changes: `'add' | 'edit' | 'delete' | 'none'`.

- **Important DAO methods**:
  - `getVisits(offset, limit, isUploaded?, isDeleted=false)`
  - `searchVisits(searchStr, offset, limit)`
  - `createVisit(data: CreateVisitRequest)`
  - `updateVisit(data: Visit)`
  - `deleteVisit(localId)`
  - `deleteLiveVisitFromLocalDb(liveId)`
  - `updateVisitUploadStatus(localId)`
  - `upsertLiveVisitIntoLocalDb(visit: Visit)` (for downstream sync)
  - `getLiveVisitIds()` (used for change feed)

- **Delete behavior**:
  - If a visit was locally added (`change_type === 'add'`), delete is a hard delete.
  - For visits that exist on the server, delete sets `change_type = 'delete'` (to be synced upstream).

## Sync Mechanics

### Downstream (Server -> Device)
- `fetchAndStoreVisits(siteId?: number)` in `src/services/sync/visits.ts`:
  1. Determine `timestamp`: global last fetched or per-site last sync.
  2. Get all live visit IDs from local DB to help the server compute changes.
  3. Loop using `offset` with `apiClient.visits.fetchChanges(timestamp, visitIds, offset, siteId)`.
  4. For each page:
     - Upsert returned `visits` via `visits.upsertLiveVisitIntoLocalDb`.
     - Delete locally any IDs from `deleted_visit_ids`.
  5. Update last-sync timestamp (per-site or global) and show a Toast.

API contract for change feed (`VisitService.fetchChanges`):
```ts
POST /api/appv2/fetchHelperData/visits
Body: { site_id?, timestamp, visit_ids, offset }
Response: { total, visits: Visit[], deleted_visit_ids: number[] }
```

### Upstream (Device -> Server)
- `uploadVisitData()` in `src/services/sync/visits.ts`:
  1. Pull visits from local DB (including deleted) and split by `change_type`.
  2. Process in order: deleted -> edited -> added.
     - Deleted: `apiClient.visits.deleteVisit(visit)`; then `deleteLocalVisit(local_id)`.
     - Edited: `apiClient.visits.updateVisit(visit)`; then `updateVisitUploadStatus(local_id)`.
     - Added: `apiClient.visits.createVisit(visit as any)`; then `deleteLocalVisit(local_id)`.

CRUD endpoints used (`src/services/api/visits.ts`):
- `POST /api/visits/` (create)
- `PUT /api/visits/:id` (update)
- `DELETE /api/visits/:id` (delete)

Note: Visit images are handled via the visit images module (`src/services/api/visit_images.ts` and DAO) and are attached separately from the visit upload flow.

## Pagination & Search Details
- **Pagination**: `Visits.tsx` keeps `visitsPage` state; each page loads 10 items.
- **Search**: When `searchQuery` is non-empty, queries `searchVisits` with `LIKE '%query%'` and paginates similarly.

## Current Limitations
- **Editing metadata is disabled**: In `VisitForm`, core fields are disabled, and the edit flow currently focuses on attaching images.
- **Add Visit button is commented out**: `AddIconButton` creation block in `Visits.tsx` is commented. Creating visits via UI is effectively off by default.
- **Edit visit save**: In `Visits.tsx`, the call to `daoClient.visits.updateVisit(request)` is commented. Metadata updates will not persist unless this is restored and fields are enabled.

## Developer Tips
1. **Enable creating visits**
   - Uncomment the `AddIconButton` block in `Visits.tsx` and allow editable fields in `VisitForm` when `changeMode === 'add'`.

2. **Enable visit metadata updates**
   - In `Visits.tsx`, restore the `updateVisit` call on edit submit.
   - In `VisitForm`, remove `disabled` from inputs and ensure validation.

3. **Extend Visit fields**
   - Add fields to `Visit` and `CreateVisitRequest` types.
   - Update `visits` table schema in `VisitsDao.createTable`.
   - Update DAO CRUD methods, `VisitForm`, `VisitCard`, `VisitInfo`, and API payloads.

4. **Site-specific sync**
   - When `siteId` is provided to `fetchAndStoreVisits`, last-sync is tracked per site via `siteSync` table.

## How It All Ties Together
- User navigates to Visits screen -> list is loaded from local DB with pagination.
- User opens a visit -> Details modal shows metadata and image count.
- User taps Add Visit Images -> VisitForm opens in edit mode, user attaches images -> images are inserted locally and marked for upload via related image sync.
- Sync screen or background job can run `fetchAndStoreVisits` (downstream) and `uploadVisitData` (upstream) to reconcile data.

---
If you’d like, I can also generate a high-level diagram (sequence/flow) or enable the disabled features with small code changes.
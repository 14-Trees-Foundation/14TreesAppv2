# Plots (Mobile App)

This document explains how the Plots section works in the mobile app: UI flow, local storage, sync mechanics, and API interactions. It mirrors the structure used for Visits.

## Overview
- **Purpose**: Browse and manage planting plots, filter by site, view details, edit plot metadata, and launch tree-related actions (add/move/audit/map).
- **Offline-first**: Uses local SQLite for storage with upstream/downstream sync.
- **Pagination & Search**: Paginated list (10 at a time) with search by name and plot ID. Optional site filter.

## Key Files
- **Screen**: `src/screens/Plots.tsx`
- **Components**:
  - `src/components/plots/PlotsCard.tsx`
  - `src/components/plots/PlotsInfo.tsx`
  - `src/components/plots/PlotsForm.tsx`
  - `src/components/plots/SaplingRangeModal.tsx`
- **Model**: `src/model/plot.ts`
- **Local DB (DAO)**: `src/services/db/plots.ts`
- **Sync logic**: `src/services/sync/plots.ts`
- **API client**: `src/services/api/plots.ts`

## UI and User Flow
1. **List and Filters** (Plots.tsx)
   - Loads plots from local DB in pages of 10 via `DaoClient.plots.getPlots(offset, limit, isUploaded?, isDeleted?, siteId?)`.
   - Infinite scroll triggers `onEndReached` to fetch next page.
   - Search queries `DaoClient.plots.searchPlots('%query%', offset, limit, siteId?)` (searches name and plot_id).
   - Optional Site filter using an autocomplete; selected site is persisted in `AsyncStorage` under `Constants.selectedSite`.
   - Duplicates are filtered by `local_id`.

2. **Card actions** (PlotsCard)
   - **Add Trees**: Opens bulk add modal (SaplingRangeModal) to navigate to BulkAddTrees.
   - **Move Trees**: Navigates to ChangePlot flow with the selected plot.
   - **Audit**: Navigates to PlotAudit screen.
   - **Tree Map**: Opens Map centered on the plot.

3. **Info modal** (PlotsInfo)
   - Shows core plot metadata (name, plot id, category). Includes Close; delete/edit UI hooks are scaffolded.

4. **Form** (PlotsForm)
   - Create/edit form for plot metadata: name, plot_id, tags (comma-separated), gat, category.
   - On submit:
     - Add mode: creates plot locally with `change_type = 'add'`.
     - Edit mode: updates plot locally with `change_type = 'edit'` unless it was `'add'` (then stays `'add'`).

5. **Add button**
   - A Floating Add Button is present in comments in `Plots.tsx`. Re-enable to allow creating plots from UI.

## Data Model
```ts
// src/model/plot.ts
export type Plot = {
  local_id: number,
  id?: number;
  name: string;
  plot_id: string;
  category: 'Public' | 'Foundation' | null;
  tags: string | null; // comma-separated in local DB
  gat: string | null;
  status: string | null;
  boundaries: string | null; // JSON string in local DB
  site_id: number | null;
  is_uploaded: 0 | 1
  change_type: 'none' | 'add' | 'edit' | 'delete',
  created_at: string;
  updated_at: string;
}

export type CreatePlotRequest = {
  name: string;
  plot_id: string;
  tags: string | null;
  gat: string | null;
  category: 'Public' | 'Foundation' | null;
}
```

## Local Database
- **Table**: `plots` (`src/services/db/plots.ts`)
  - Fields include live `id` (optional), metadata, `status`, `boundaries`, `site_id`, `is_uploaded`, `change_type`.
  - `releaseChanges()` ensures `boundaries` column exists and resets last-sync if schema changed.

- **Important DAO methods**:
  - `getPlots(offset, limit, isUploaded?, isDeleted?, siteId?)`
  - `searchPlots(searchStr, offset, limit, siteId?)`
  - `createPlot(data: CreatePlotRequest)`
  - `updatePlot(data: Plot)`
  - `deletePlot(localId)`
  - `deleteLivePlotFromLocalDb(liveId)`
  - `deleteLocalPlot(localId)`
  - `updatePlotUploadStatus(localId)`
  - `upsertLivePlotIntoLocalDb(plot: Plot)` (for downstream sync)
  - `getLivePlotIds()`

- **Delete behavior**:
  - If `change_type === 'add'`: hard delete.
  - Otherwise: set `change_type = 'delete'` and `is_uploaded = 0` for upstream deletion.

## Sync Mechanics

### Downstream (Server -> Device)
- `fetchAndStorePlots(siteId?)` in `src/services/sync/plots.ts`:
  1. Compute `timestamp` (global or per-site last sync).
  2. Get all live plot IDs from local DB.
  3. Fetch changes in pages with `apiClient.plots.fetchChanges(timestamp, plotIds, offset, siteId)`.
  4. For each page:
     - Normalize payload: `tags` array -> comma-separated string; `boundaries` object -> JSON string.
     - Upsert via `upsertLivePlotIntoLocalDb`.
     - Delete any `deleted_plot_ids` locally.
  5. Update last-sync timestamp and show a Toast.

API contract (`PlotService.fetchChanges`):
```ts
POST /api/appv2/fetchHelperData/plots
Body: { site_id?, timestamp, plot_ids, offset }
Response: { total, plots: Plot[], deleted_plot_ids: number[] }
```

### Upstream (Device -> Server)
- `uploadPlotsData()`:
  1. Load all locally changed plots (including deletions).
  2. Process order: deleted -> edited -> added.
     - Deleted: `deletePlot` then `deleteLocalPlot(local_id)`.
     - Edited: Convert local `tags` string to array; `updatePlot` then `updatePlotUploadStatus(local_id)`.
     - Added: Convert `tags` string to array; `createPlot` then `deleteLocalPlot(local_id)`.

CRUD endpoints (`src/services/api/plots.ts`):
- `POST /api/plots/` (create)
- `PUT /api/plots/:id` (update)
- `DELETE /api/plots/:id` (delete)

## Pagination, Search, and Site Filter
- **Pagination**: `plotsPage` controls page; each page has 10 items.
- **Search**: `name LIKE '%query%' OR plot_id LIKE '%query%'`, respects selected site when provided.
- **Site filter**: Autocomplete-driven; persists selected site in `AsyncStorage` and refreshes list on change.

## Current Limitations
- **Add plot button commented out**: UI creation disabled by default; re-enable Floating Add Button.
- **Boundaries editing not exposed**: The field exists in DB and sync but not editable in UI.

## Developer Tips
1. **Enable creating plots**
   - Uncomment Floating Add Button block in `Plots.tsx` and wire `changeMode='add'` properly.
2. **Expose more fields**
   - Add inputs for `status`, `site_id`, and `boundaries` in `PlotsForm`.
   - Update DAO methods and normalization in sync (e.g., parse/serialize JSON for `boundaries`).
3. **Improve delete UX**
   - Re-enable Edit/Delete actions in `PlotsInfo` header for quick management.
4. **Site-specific sync**
   - Pass `selectedSite.id` into `fetchAndStorePlots` when syncing by site to leverage per-site last-sync tracking.

## End-to-End Flow
- User selects a site (optional) -> Plots list loads from local DB with pagination.
- User opens a plot -> Info modal shows details.
- User uses actions: Add Trees (bulk), Move Trees, Audit, or Tree Map.
- Sync processes reconcile local changes with the server and fetch remote updates in pages.

---
If you want, I can enable the add button and expose additional fields (status/boundaries) in the form, plus add a simple diagram to this doc.
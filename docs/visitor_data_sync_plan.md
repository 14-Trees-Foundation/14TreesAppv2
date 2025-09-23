# Visitor Data Capture + Sync — Change Plan (Mobile)

## Goal
- Capture visitor images without creating trees from Visits screen.
- On sync: if tree exists (added via Trees/Plots), attach images to that tree; else upload visitor images separately to backend (server will hold by sapling_id and link when tree is created).

## Data Model / DB (Mobile)
- Reuse `tree_images` with types: `user_tree_image`, `user_card_image`.
- Do NOT add a server `id` column; track via `is_uploaded` only.
- No changes to `trees` table; Visits flow must not insert into `trees`.

## API (Alignment with backend)
- No reconcile endpoint after tree creation; linking happens on server during tree creation using `sapling_id`.
- No device→server fetch for visitor images (no pull path required).
- Mobile needs:
  - Use existing tree endpoints when a tree exists (create/update carries images by `sapling_id`).
  - Add a visitor-only upload call on Tree service (e.g., `POST /api/appv2/upload-visitor-images`) that accepts `{ sapling_id, images: [{ name, data, type }] }`. Backend stores these under sapling_id (internally in trees payload) to be linked when a tree for that sapling_id is created.

## Mobile UI/Flow (Visits screen)
- In `src/screens/Visits.tsx`:
  1. On capture, save via `TreeImagesDao.upsertTreeImage({ sapling_id, name, data, type: 'user_tree_image'|'user_card_image' })`.
  2. Do not create any `tree` row.
  3. Enforce `sapling_id` (QR/manual).

## Sync Upload Logic
- Keep order in `uploadLocalData`: users → trees → tree_snapshots → visit_images → visitor_data → sync_info.
- Update `uploadVisitorData(syncTime)`:
  - Get pending visitor images of both types.
  - If a local tree exists for `sapling_id`, rely on normal Trees upload/update to carry/attach images; otherwise call the visitor-only upload.
  - On success: `markImageUploaded(local_id)`.
  - Update `sync_info.visitor_data` counts per type.

## Fetch/Delta Logic
- Not required for visitor images (device → server only).

## Linking After Tree Creation
- Only Option A: server links previously uploaded visitor images by `sapling_id` when the tree is created from mobile. No extra mobile calls.

## Validation & UX
- Block capture/save if `sapling_id` missing.
- (Optional) Show pending visitor image counts via `TreeImagesDao.countVisitorImages(false)` on Sync screen.

## Error Handling
- Wrap uploads in try/catch; log with `Utils.saveErrorLog`.
- Failures in visitor uploads should not block other entities.

## Test Plan
1. Capture visitor images for sapling S (no tree). Run sync → images uploaded (visitor-only), no tree row created on device.
2. Create tree for sapling S from Trees screen. Run sync → tree uploaded; server links any previously uploaded visitor images by `sapling_id`.
3. Offline capture then online sync → visitor images uploaded once; `is_uploaded=1` locally.

## Files likely to change
- `src/screens/Visits.tsx` — capture behavior (no tree creation; save images only).
- `src/services/sync/visitor_data.ts` — upload via Tree service; remove reliance on non-existent `treeImages` API; update sync_info.
- `src/services/api/trees.ts` — add `uploadVisitorImages(saplingId, images)` method (client stub) to call backend visitor-only upload.
- `src/services/db/tree_images.ts` — no schema changes; ensure helpers exist (get, count, mark uploaded).
- `src/services/sync/sync.ts` — keep upload order; ensure `changesCount.visitor_data` computed using DAO counts.
- `src/services/Strings.js` — minor copy (if needed).
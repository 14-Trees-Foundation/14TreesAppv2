# Visitor Data Flow: Plan and Technical Notes (Reworked)

## 1) Background and Goal
We want to split “tree data capture” into two flows:
- Visitor-level capture: Sapling ID, User (who visited), User Tree Image, and User Card Image. Triggered from a visit.
- Tree-level capture: Full tree fields from Plots/Trees screens as before.

Also, offer a range-based workflow similar to Plots → Add Trees: pre-select a range of sapling IDs, then tap a sapling chip to quickly add visitor data for that sapling.

## 2) UX Changes
- Visits list → VisitCard:
  - Replace "Add Tree" with "Add Visitor Data".
  - On press, open a modal that captures:
    - Sapling ID (manual input or prefetched from range flow)
    - User (optional; prefilled to current user when available, selectable)
    - User Tree Image (optional)
    - User Card Image (optional)

- Range-based visitor capture (optional entry points):
  - Add an option from VisitCard to set a sapling ID range (mirroring Plots → Add Trees).
  - After entering a range, present a chip list of saplings; tapping a chip opens the Visitor Data modal prefilled with that sapling ID.

Notes:
- We can add a second action button on VisitCard (e.g., “Add Visitor Data (Range)”) or make the primary button open a choice (Single vs Range).
- Keep the existing "Add Visit Images" button as-is (visit-level images, separate from sapling images).

## 3) Scope of Data and Validation
- Visitor Data Form fields:
  - Sapling ID (required)
  - User (required) — prefilled from the current logged-in user; selectable via dropdown if needed
  - User Tree Image (optional)
  - User Card Image (optional)
- No plot, plant type, tree status, GPS/location, or generic tree image required for this flow.
- Allow saving visitor data even if there is no existing tree record yet.

## 4) Reuse vs New Form Component
### Option A: Reuse TreeForm with conditional UI (hide fields)
- Cons: TreeForm enforces validations for plot/plant type/status/image/coordinates and triggers tree creation/update.

### Option B: New lightweight VisitorDataForm (recommended)
- Simple, focused: Sapling ID + User + two image selectors.
- Minimal validation and clearer data flow; lower risk of regressions.

Decision: Implement a new `VisitorDataForm.tsx` for clarity and safety.

## 5) Data Model and DB
- Persist visitor images and user info in `tree_images` via `TreeImagesDao.upsertTreeImage` with types:
  - `user_tree_image`
  - `user_card_image`
- `tree_images` schema (as created on device) includes: `sapling_id TEXT NOT NULL`, `type`, and `user_id INTEGER NULL`, among other fields. There is NO foreign key constraint from `tree_images.sapling_id` to `trees.sapling_id`.
- Therefore, visitor data can exist for saplings without a corresponding row in `trees`.
- Tree ↔ user mapping in the current tree table (TypeScript DAO) uses `assigned_to` (and related fields). We will NOT touch `trees` for the visitor-only flow. If/when a tree is later created or updated, server/backend may reconcile the association based on sapling_id and/or `user_id` embedded in `tree_images`.

## 6) Screens and Components
- Update `VisitCard`:
  - Change label from "Add Tree" to "Add Visitor Data".
  - Keep the prop name `onTreeAdd` for now to avoid refactors, but it will open the visitor modal instead of the tree form.

- `Visits.tsx` changes:
  - Replace `treeModal` usage for this flow with `visitorModal` (boolean state).
  - Render new `VisitorDataForm` within a modal when `visitorModal` is true.
  - Implement `handleVisitorSave({ saplingId, userId, userTreeImage?, userCardImage? })`:
    - For each provided image, call `DaoClient.treeImages.upsertTreeImage({ sapling_id, name, data, type, user_id })` with type `user_tree_image`/`user_card_image`.

- New `VisitorDataForm.tsx` (in `src/components/visitor/`):
  - Props: `{ saplingId?: string; defaultUserId?: number; onSubmit(payload): void; onCancel(): void }`
  - Fields:
    - TextInput: Sapling ID (required)
    - Dropdown: User (required). Prefill with `Utils.getUserId()`; options from `UsersDao`.
    - ImageSelector: User Tree Image (optional)
    - ImageSelector: User Card Image (optional)
  - Submit: validate saplingId + userId; images optional. Return payload for upserts.

- Range-based flow (similar to BulkAddTrees):
  - Reuse `SaplingRangeModal` to get a list of sapling IDs.
  - New screen `BulkAddVisitorData.tsx` modeled on `BulkAddTrees.tsx`:
    - Show SaplingChipList for the entered range.
    - On chip click → open `VisitorDataForm` prefilled with the sapling id and default user.
    - Persist images on save via upsert calls.

## 7) Strings and Localization
- Update `src/services/Strings.js`:
  - Add `buttonLabels.AddVisitorData` and replace usage in `VisitCard`.
  - Optional: `labels.SelectUser` for form.

## 8) Navigation
- If adding `BulkAddVisitorData`, register it similar to `BulkAddTrees`.
- From Visit → VisitCard → onRange click: open `SaplingRangeModal`, then navigate to `BulkAddVisitorData` with `{ saplings }`.

## 9) Error Handling and Edge Cases
- Sapling ID without existing tree: allowed; we save in `tree_images` and set `user_id` there.
- Replacing visitor images: `upsertTreeImage` overwrites the latest image per type for that sapling.
- Offline usage: fully supported by local DB. Upload flags and sync should pick these up.
- Duplicate sapling IDs in range: de-duplicate before rendering chips.

## 10) Testing Plan
- Single visitor capture from VisitCard: save with user only; with user + one image; with both images.
- Range-based capture: create range, open chip → modal → save; verify images stored and retrievable via `getTreeImagesForSaplingId`.
- Switching language shows updated button label.

## 11) Implementation Steps
1. Add `buttonLabels.AddVisitorData` (EN + MR) and update `VisitCard` label.
2. Create `VisitorDataForm.tsx` (sapling input + user dropdown + two ImageSelector controls + submit/cancel).
3. Update `Visits.tsx`:
   - Add `visitorModal` state; open on VisitCard button press.
   - Hook `onSubmit` to call `treeImages.upsertTreeImage` for submitted images, passing `user_id`.
4. Range flow:
   - Add a second button or overflow action on `VisitCard` for range-based visitor data.
   - Reuse `SaplingRangeModal` to get `saplings`.
   - Implement `BulkAddVisitorData.tsx` (chip list + VisitorDataForm on chip tap).
   - Register new screen in navigation.
5. QA passes and refine UX copy/flow.

## 12) Schema Confirmation (mobile device)
- `tree_images` (from `src/services/db/tree_images.ts`) is created without a foreign key to `trees`:
  - Columns include `sapling_id TEXT NOT NULL`, `type`, `user_id INTEGER NULL`, flags, and timestamps; no `FOREIGN KEY` clause.
- Current `trees` (from `src/services/db/trees.ts`) contains `assigned_to` fields for user mapping and also legacy columns such as `user_tree_image`, `user_card_image` used by older flows.
- Legacy code (`src/services/tree_db.js`) references an older `sapling_images` table with a foreign key to `trees`, but the new `tree_images` table (TypeScript DAO) does not enforce FK constraints.

## 13) Risks and Mitigations
- Backend may require a `trees` row to accept visitor images.
  - Mitigation: Keep `user_id` on `tree_images`; coordinate with backend to allow visitor-only images. If required, delay sync until a tree exists or create a lightweight tree record.
- Overload VisitCard with too many actions.
  - Mitigation: Consider an overflow menu or a secondary action for range flow.

## 14) Open Questions
- Enforce at least one visitor image, or allow zero? Currently: allow zero.
- Whether to restrict user selection to current user or allow full list.
- Confirm Marathi translation for "Add Visitor Data".

## 15) Estimation
- VisitorDataForm + single-flow wiring: ~0.5–1 day.
- Range-based flow (modal + new screen + navigation): ~1–1.5 days.
- Strings, light QA, and polish: ~0.5 day.
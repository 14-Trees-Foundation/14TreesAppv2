# Backend Changes — Visitor Images Upload and Sync History

## Summary
Ensure the backend supports uploading visitor-only images with an optional `visitor_id`, and that sync history responses include aggregated visitor image counts so the mobile app can display them.

## 1) Endpoint: Upload Visitor Images
- **Method/Path**: `POST /api/appv2/upload-visitor-images`
- **Purpose**: Accepts user-submitted images that belong to a sapling (may be before a full tree record exists). Optionally associates the upload with a specific visitor.
- **Auth**: Same JWT/session auth as other appv2 endpoints.

### Request payload (from mobile client)
```json
{
  "sapling_id": "<string>",
  "images": [
    { "name": "<filename>.jpg", "data": "<base64>", "type": "user_tree_image" },
    { "name": "<filename>.jpg", "data": "<base64>", "type": "user_card_image" }
  ],
  "visitor_id": 123   // optional
}
```
- **Constraints**:
  - `type` is one of: `user_tree_image`, `user_card_image`.
  - `data` is base64-encoded image bytes.
  - `visitor_id` may be omitted; when present, link images to that visitor.

### Expected server behavior
1. Validate payload: presence of `sapling_id`, non-empty `images[]`, allowed `type` values.
2. Persist images and metadata:
   - Store images (blob/object storage) and create DB rows linked by `sapling_id`.
   - If `visitor_id` present, associate the images to the visitor as well (FK or join-table).
3. Return identifiers and per-type tallies for the request.
4. Update/emit sync aggregation (see section 2) so live sync history can include these visitor counts.

### Response shape (suggested)
```json
{
  "success": true,
  "uploaded": [
    { "id": 1001, "type": "user_tree_image", "name": "..." },
    { "id": 1002, "type": "user_card_image", "name": "..." }
  ],
  "counts": { "user_tree_image": 1, "user_card_image": 1 }
}
```
- On partial failure, include `success: false`, an `error` message, and any `uploaded` subset if applicable.

## 2) Sync History — Include Visitor Image Counts
Mobile expects aggregated counts to be part of sync history items (both live and historical) under a `visitor_data` object.

- **Fields to include** on each sync record in the history response:
  - `trees`: existing aggregate (unchanged)
  - `tree_images`: existing aggregate (unchanged)
  - `visit_images`: existing aggregate (unchanged)
  - `users`: existing aggregate (unchanged)
  - `visitor_data`: new object with per-type counts

### visitor_data shape
```json
{
  "user_tree_image": 0,
  "user_card_image": 0
}
```
- Defaults: If not available, provide zeros for both keys.
- Semantics: Totals for that sync window (same meaning as other aggregate fields returned today).

### Where to include it
- Any endpoint powering the app’s sync history list and live sync progress. For example, responses that the mobile client uses to upsert a sync record via `upsertLiveSyncInfo` should include `visitor_data`.

## 3) Aggregation Model
- When visitor images are accepted (section 1), increment counts in the current sync context:
  - `visitor_data.user_tree_image += count(images where type == 'user_tree_image')`
  - `visitor_data.user_card_image += count(images where type == 'user_card_image')`
- If the server computes sync records in batch, ensure these counts are reflected in the computed period.

## 4) Validation & Error Handling
- **Validation**:
  - `sapling_id`: must exist or be a valid pre-tree identifier used by the app.
  - `visitor_id` (if provided): must refer to an existing visitor and belong to the same site/tenant as `sapling_id`.
  - `images[]`: enforce max items and size limits; validate base64.
- **Errors**: Use consistent error codes/messages as other appv2 endpoints. Return HTTP 400 for validation errors, 401/403 for auth, 5xx for server issues.

## 5) Storage & Linking
- Store image bytes in object storage (or DB blob), keep metadata rows with:
  - `id`, `sapling_id`, optional `visitor_id`, `type`, `original_name`, `mime`, `size`, `created_at`.
- Ensure later tree creation can link back via `sapling_id` without data loss.

## 6) Backward Compatibility / Migration
- Sync history: If older records lack `visitor_data`, emit `{ "user_tree_image": 0, "user_card_image": 0 }`.
- Upload endpoint: Adding optional `visitor_id` is backward-compatible.

## 7) Security Considerations
- Enforce auth and authorization on the endpoint (site/tenant scoping for `sapling_id` and `visitor_id`).
- Virus/malware scanning as per existing image pipeline (if applicable).
- Rate limiting/throttling consistent with other upload endpoints.

## 8) Testing Checklist
1. Upload with only `sapling_id` and images — success; counts match types.
2. Upload with `sapling_id`, images, and valid `visitor_id` — linked and counted.
3. Upload with invalid `visitor_id` — 400 with clear error.
4. Upload with mixed types — counts split correctly.
5. Large base64 image rejected according to limits with proper error.
6. Sync history endpoint returns `visitor_data` with correct totals for the period.
7. Historical records without `visitor_data` return zeros.
8. Authorization: users cannot upload/see data across tenants/sites.

## 9) Example cURL
```bash
curl -X POST https://<host>/api/appv2/upload-visitor-images \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sapling_id": "sap-123",
    "images": [
      { "name": "tree1.jpg", "data": "<base64>", "type": "user_tree_image" },
      { "name": "card1.jpg", "data": "<base64>", "type": "user_card_image" }
    ],
    "visitor_id": 789
  }'
```

---

If you prefer a different response shape or need additional metadata (e.g., storage URLs), note it here so the mobile client can adapt accordingly.
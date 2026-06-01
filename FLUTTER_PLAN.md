# Flutter App — Migration Plan

New Flutter app replacing the React Native field app. Scope is intentionally minimal:
**one-time auth → add trees → add tree updates → offline storage → sync when online.**

---

## Tech Stack

| Concern | Package |
|---|---|
| Local database | `drift` (SQLite ORM) |
| HTTP client | `dio` |
| Image capture | `image_picker` + `flutter_image_compress` |
| Connectivity watch | `connectivity_plus` |
| Secure storage | `flutter_secure_storage` |
| State management | `riverpod` |
| Navigation | `go_router` |
| Maps (if needed later) | `google_maps_flutter` |

---

## Screens (5)

1. **SplashScreen** — Check stored token → route to Home or Login
2. **LoginScreen** — Phone + 4-digit PIN entry, store token on success
3. **HomeScreen** — Stats (trees planted), button to add tree, list of recent entries, sync status indicator
4. **AddTreeScreen** — Form: sapling ID, plant type, plot, location (GPS auto-fill), status, take photo (required)
5. **AddTreeUpdateScreen** — Select existing tree, update status, take photo (required)

---

## Database Schema (drift)

### `trees` table

```dart
local_id        INTEGER PK AUTOINCREMENT
id              INTEGER NULL              // server ID, null until synced
sapling_id      TEXT UNIQUE NOT NULL
plant_type_id   INTEGER NOT NULL
plot_id         INTEGER NOT NULL
location        TEXT                      // JSON: {"type":"Point","coordinates":[lon,lat]}
planted_by      TEXT
tree_status     TEXT DEFAULT 'healthy'    // healthy | diseased | dead | lost
assigned_to     INTEGER NULL              // server user ID
change_type     TEXT DEFAULT 'add'        // add | edit | none
is_uploaded     INTEGER DEFAULT 0
created_at      TEXT
updated_at      TEXT
```

### `tree_images` table

```dart
local_id        INTEGER PK AUTOINCREMENT
sapling_id      TEXT NOT NULL             // FK to trees.sapling_id
name            TEXT NOT NULL             // filename
data            TEXT NOT NULL             // base64 encoded
type            TEXT NOT NULL             // tree_image | tree_snapshot
is_uploaded     INTEGER DEFAULT 0
timestamp       TEXT
```

### `plant_types` table (reference data, synced down only)

```dart
id              INTEGER PK
name            TEXT NOT NULL
```

### `plots` table (reference data, synced down only)

```dart
id              INTEGER PK
name            TEXT NOT NULL
site_id         INTEGER
```

---

## Auth Flow

**Endpoint**: `POST /api/appv2/login`

**Request**:
```json
{ "phone": "1234567890", "pinNumber": "1234" }
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Field Worker",
    "phone": "1234567890",
    "roles": ["treelogging"],
    "token": "<auth_token>"
  }
}
```

**Storage** (flutter_secure_storage):
- `auth_token` ← `user.token`
- `user_id` ← `user.id`
- `user_name` ← `user.name`
- `user_role` ← first role from `user.roles`

Auth is one-time. Token persists across app restarts. No logout screen needed for v1.

---

## Add Tree Flow

1. User fills form: sapling ID (manual or scanned), plant type (dropdown), plot (dropdown), tree status
2. GPS location auto-captured via `geolocator`; user can re-trigger
3. User takes photo (mandatory — camera opens inline)
4. On save:
   - Insert row into `trees` with `change_type='add'`, `is_uploaded=0`
   - Insert image row into `tree_images` with `type='tree_image'`, `is_uploaded=0`
   - Show success, reset form

---

## Add Tree Update Flow

1. User searches/selects existing tree by sapling ID
2. User updates status (dropdown: healthy / diseased / dead / lost)
3. User takes photo (mandatory)
4. On save:
   - Update `trees` row: set new status, `change_type='edit'`, `is_uploaded=0`, `updated_at=now`
   - Insert new image row: `type='tree_snapshot'`, `is_uploaded=0`

---

## Sync Engine

### Trigger
- On app foreground: check connectivity via `connectivity_plus`
- When connection detected, run sync automatically (no manual button needed, but show status)

### Upload sequence

```
1. Fetch all trees WHERE change_type IN ('add', 'edit') AND is_uploaded = 0
2. For each tree:
   a. Fetch associated images WHERE is_uploaded = 0
   b. If change_type = 'add':
        POST /api/appv2/uploadTrees
        Body: { sapling_id, plant_type_id, plot_id, location, planted_by,
                tree_status, assigned_to, images: [{name, data}] }
        On success: update local tree — id = server_id, change_type='none', is_uploaded=1
        Mark images is_uploaded=1
   c. If change_type = 'edit':
        POST /api/appv2/updateSapling
        Header: x-access-token: <token>
        Body: { tree: {...}, new_image: {name, data} }
        On success: change_type='none', is_uploaded=1
        Mark image is_uploaded=1
3. Show sync result: N trees synced, N failed
```

### Error handling
- Failed uploads stay `is_uploaded=0` and retry on next sync
- Log failures locally; do not block UI
- Images are uploaded inline with each tree (not separately)

### Download (reference data)
On first launch after login, fetch and store:
- Plant types: `GET /api/appv2/plant-types` → store in `plant_types` table
- Plots for selected site: from existing fetch endpoints → store in `plots` table

Re-fetch reference data once per day or on manual pull-to-refresh.

---

## API Reference

All requests to: `API_HOST` (from `.env`, e.g. `https://api.14trees.org`)

| Method | Endpoint | Auth Header | Purpose |
|---|---|---|---|
| POST | `/api/appv2/login` | none | Authenticate user |
| POST | `/api/appv2/uploadTrees` | `user-id: <id>` | Upload new trees |
| POST | `/api/appv2/updateSapling` | `x-access-token: <token>` | Update existing tree |
| POST | `/api/appv2/fetchHelperData/trees` | none | Fetch tree changes (download) |

**Location format** (matches existing API):
```json
{ "type": "Point", "coordinates": [longitude, latitude] }
```
Store as JSON string in DB, parse on upload.

---

## Project Structure

```
lib/
├── main.dart
├── app.dart                    # GoRouter setup, ProviderScope
├── core/
│   ├── database/
│   │   ├── database.dart       # Drift DB definition
│   │   ├── tables/             # trees.dart, tree_images.dart, etc.
│   │   └── daos/               # trees_dao.dart, images_dao.dart
│   ├── network/
│   │   ├── api_client.dart     # Dio setup, base URL, auth header
│   │   └── endpoints/          # trees_api.dart
│   └── sync/
│       └── sync_service.dart   # Upload logic, connectivity listener
├── features/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   └── auth_provider.dart
│   ├── home/
│   │   ├── home_screen.dart
│   │   └── home_provider.dart
│   ├── trees/
│   │   ├── add_tree_screen.dart
│   │   ├── add_tree_update_screen.dart
│   │   └── trees_provider.dart
│   └── sync/
│       └── sync_status_widget.dart
└── models/
    ├── tree.dart
    └── tree_image.dart
```

---

## Build Flavors

Mirror the existing RN app:

| Flavor | API Host | App Name |
|---|---|---|
| `dev` | `https://dev-api.14trees.org` | Dev Trees |
| `prod` | `https://api.14trees.org` | 14 Trees |

Use `--dart-define` or `flutter_flavorizr` for flavor config.

---

## Phased Delivery

### Phase 1 — Core (target: working field app)
- [ ] Project setup, flavors, drift DB
- [ ] Login screen + token storage
- [ ] Add Tree screen with GPS + camera
- [ ] Offline storage (trees + images)
- [ ] Sync engine (upload only)
- [ ] Home screen with basic stats

### Phase 2 — Updates & Polish
- [ ] Add Tree Update screen
- [ ] Sync status UI (progress, last synced time, failure count)
- [ ] Download reference data (plant types, plots)
- [ ] Pull-to-refresh for reference data

### Phase 3 — Nice to have
- [ ] Map view of trees added in current session
- [ ] Offline sapling ID validation
- [ ] Push notification when sync completes in background

---

## Appendix — All API Endpoints in Current Codebase

Base URL: `API_HOST` env var (`https://api.14trees.org` / `https://dev-api.14trees.org`)

Two URL patterns exist:
- **Legacy**: `/api/appv2/...` — bulk/shift-based operations from `DataService.js`
- **New**: `/api/<resource>/...` — REST-style CRUD from `src/services/api/*.ts`

### Authentication

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/appv2/login` | none | Login with phone + PIN, returns token |
| POST | `/api/appv2/verifyUser` | none | Admin verifies a staff user |
| POST | `/api/appv2/getUnverifiedUsers` | none | List users pending verification |

### Trees

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/appv2/uploadTrees` | `user-id` header | Upload new trees (batch) |
| POST | `/api/appv2/updateSapling` | `x-access-token` | Update a single tree |
| POST | `/api/appv2/getSapling` | `x-access-token` | Fetch single tree by sapling_id |
| POST | `/api/appv2/treesUpdatePlot` | none | Reassign trees to a new plot |
| DELETE | `/api/trees/{id}` | none | Delete a tree |
| GET | `/api/appv2/trees-count?name={userName}` | none | Tree analytics count for a user |
| POST | `/api/trees/get-trees-plantation-info` | none | Paginated plantation info |
| POST | `/api/appv2/fetchHelperData/trees` | none | Delta sync — download tree changes |

### Tree Snapshots (tree status photos over time)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/tree-snapshots` | none | Upload tree snapshot images |
| POST | `/api/tree-snapshots/delete` | none | Delete snapshots by IDs |
| POST | `/api/appv2/fetchHelperData/tree-snapshots` | none | Delta sync — download snapshot changes |

### Plots

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/plots/get` | none | Get paginated plots (with filters) |
| POST | `/api/plots/` | none | Create a plot |
| PUT | `/api/plots/{id}` | none | Update a plot |
| DELETE | `/api/plots/{id}` | none | Delete a plot |
| POST | `/api/appv2/fetchHelperData/plots` | none | Delta sync — download plot changes |
| POST | `/api/appv2/fetchPlotSaplings` | `x-access-token` | Fetch saplings assigned to plots |

### Sites

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/sites/get` | none | Get paginated sites (with filters) |
| POST | `/api/sites` | none | Create a site |
| PUT | `/api/sites/{id}` | none | Update a site |
| DELETE | `/api/sites/{id}` | none | Delete a site |
| POST | `/api/appv2/fetchHelperData/sites` | none | Delta sync — download site changes |

### Users

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/users/get` | none | Get paginated users (with filters) |
| GET | `/api/users/{searchStr}` | none | Search users by name/phone |
| POST | `/api/users/` | none | Create a user |
| PUT | `/api/users/{id}` | none | Update a user |
| DELETE | `/api/users/{id}` | none | Delete a user |
| POST | `/api/appv2/fetchHelperData/users` | none | Delta sync — download user changes |

### Visits

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/visits/get` | none | Get paginated visits |
| POST | `/api/visits/` | none | Create a visit |
| PUT | `/api/visits/{id}` | none | Update a visit |
| DELETE | `/api/visits/{id}` | none | Delete a visit |
| POST | `/api/appv2/fetchHelperData/visits` | none | Delta sync — download visit changes |

### Visit Images

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/visit-images/` | none | Upload images for a visit |
| POST | `/api/visit-images/delete` | none | Delete visit images by IDs |
| POST | `/api/appv2/uploadNewImages` | none | Legacy bulk image upload |
| POST | `/api/appv2/fetchHelperData/visit-images` | none | Delta sync — download visit image changes |

### Plant Types (reference data)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/appv2/fetchHelperData/plant-types` | none | Delta sync — download plant type list |

### Shifts (legacy workflow, not needed for new app)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/appv2/fetchShifts` | `x-access-token` | Fetch shifts for a user |
| POST | `/api/appv2/uploadShifts` | none | Upload shift records |
| POST | `/api/appv2/fetchHelperData` | `x-access-token` | Legacy bulk helper data fetch |

### Sync & Diagnostics

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/appv2/sync-history` | none | Record a completed sync |
| POST | `/api/appv2/fetchHelperData/sync-history` | none | Download sync history |
| POST | `/api/appv2/uploadLogs` | none | Upload app error logs |
| POST | `/api/appv2/test-upload` | none | Network speed test (dummy payload) |

# New Mobile App — Replace Sites/Plots API with Locations API

**Purpose:** Guide for replacing the old `/api/sites/get` and `/api/plots/get` calls in the new mobile app with the new locations hierarchy API. Once this is done, the old sites/plots compatibility shims in the backend can be fully removed.

**Scope:** New mobile app only. The old app continues to use the shim endpoints (which internally query `locations`).

---

## Current behavior (old app)

| Screen | Old endpoint | What it returns |
|---|---|---|
| Site list | `POST /api/sites/get?offset=X&limit=Y` | Paginated list of sites with `id`, `name_english`, `name_marathi`, district/taluka/village, area, grove_type, etc. |
| Plot list (after site selected) | `POST /api/plots/get?offset=X&limit=Y` with filter `site_id=X` | Paginated list of plots with tree-count aggregations (total, booked, assigned, available, broken down by plant type) |

---

## New approach

### Key IDs (hardcoded — these never change)

| Location | `location_id` | `location_path` |
|---|---|---|
| India | 1 | `India` |
| Maharashtra | 2 | `India/Maharashtra` |

> These IDs are stable post-migration. Hardcode `MAHARASHTRA_LOCATION_ID = 2` in the app constants.

---

## Step 1 — Site list: new API needed

The existing `GET /api/locations/hierarchy?parent_id=X` only returns **direct children** of a parent. Maharashtra's direct children are districts — not sites.

Sites are nested deeper: `Maharashtra → District → Taluka → Settlement → Site`.

### New backend endpoint required

Add `GET /api/locations?type=site&ancestor_id=2&offset=X&limit=Y` (paginated flat list of all sites under a given ancestor).

**Repo query (descendant filter):**
```sql
SELECT
  l.id, l.location_name, l.display_name, l.location_type,
  l.parent_location_id, l.location_path, l.status,
  COALESCE(mv.total_trees_count, 0)::INTEGER   AS total_trees_count,
  COALESCE(mv.total_area_including_children, 0)::FLOAT AS area_acres,
  sd.grove_type, sd.land_type, sd.maintenance_type,
  sd.accessibility_status, sd.photo_album
FROM "14trees".locations l
LEFT JOIN "14trees".mv_location_summary mv ON mv.id = l.id
LEFT JOIN "14trees".site_details sd ON sd.location_id = l.id
WHERE l.location_type = :type
  AND l.location_path LIKE (
    (SELECT location_path FROM "14trees".locations WHERE id = :ancestor_id)
    || '/%'
  )
  AND (l.status IS NULL OR l.status NOT IN ('archived', 'decommissioned'))
ORDER BY l.location_name
LIMIT :limit OFFSET :offset
```

**Response shape:**
```json
{
  "total": 728,
  "offset": 0,
  "results": [
    {
      "id": 1045,
      "location_name": "Akharwadi",
      "display_name": "अखरवाडी",
      "location_type": "site",
      "location_path": "India/Maharashtra/Pune/Khed/Akharwadi/Akharwadi",
      "parent_location_id": 312,
      "total_trees_count": 4200,
      "area_acres": 12.5,
      "grove_type": "Farm Forest",
      "land_type": "Private",
      "maintenance_type": "3 Years",
      "accessibility_status": "accessible",
      "photo_album": "https://..."
    }
  ]
}
```

### Field mapping — old site → new location

| Old field (`sites` table) | New field | Source |
|---|---|---|
| `id` | `id` | `locations.id` (new location_id — use this going forward) |
| `name_english` | `location_name` | `locations.location_name` |
| `name_marathi` | `display_name` | `locations.display_name` |
| `district` | parsed from `location_path[2]` | `location_path` segment |
| `taluka` | parsed from `location_path[3]` | `location_path` segment |
| `village` | parsed from `location_path[4]` | `location_path` segment |
| `area_acres` | `area_acres` | `mv_location_summary.total_area_including_children` |
| `grove_type` | `grove_type` | `site_details.grove_type` |
| `land_type` | `land_type` | `site_details.land_type` |
| `maintenance_type` | `maintenance_type` | `site_details.maintenance_type` |
| `accessibility_status` | `accessibility_status` | `site_details.accessibility_status` |
| `photo_album` | `photo_album` | `site_details.photo_album` |

> Note: `district`/`taluka`/`village` can be extracted from `location_path` by splitting on `/`:
> `"India/Maharashtra/Pune/Khed/Akharwadi"` → district=`Pune`, taluka=`Khed`, village=`Akharwadi`.

---

## Step 2 — Plot list: use existing hierarchy API

Once a site is selected (you have its `location_id`), plots are its **direct children**. Use the existing endpoint:

```
GET /api/locations/hierarchy?parent_id=<site_location_id>
```

This returns all plots under the site — no new endpoint needed.

**Response shape (existing):**
```json
[
  {
    "id": 5032,
    "location_name": "Plot A",
    "display_name": null,
    "location_type": "plot",
    "parent_location_id": 1045,
    "location_path": "India/Maharashtra/Pune/Khed/Akharwadi/Akharwadi/Plot A",
    "total_trees_count": 320,
    "total_area_including_children": 3.2,
    "document_count": 0,
    "alert_count": 0
  }
]
```

### Field mapping — old plot → new location

| Old field (`plots` table) | New field | Source |
|---|---|---|
| `id` | `id` | `locations.id` |
| `name` | `location_name` | `locations.location_name` |
| `site_id` | `parent_location_id` | `locations.parent_location_id` |
| `plot_id` (string identifier) | `plot_id` | `plot_details.plot_id` (from `GET /api/locations/:id`) |
| `area_acres` | `total_area_including_children` | `mv_location_summary` |
| `total` (tree count) | `total_trees_count` | `mv_location_summary` |
| `accessibility_status` | fetch via `GET /api/locations/:id` | `plot_details.accessibility_status` |
| `category` | fetch via `GET /api/locations/:id` | `plot_details.category` |
| `boundaries` | fetch via `GET /api/locations/:id` | `plot_details.boundaries` |

> **Note on tree-count breakdown (booked/assigned/available by plant type):** The old plots response computed 20+ aggregated columns (booked_trees, available_shrubs, etc.) via a heavy JOIN. These are NOT in the locations API. For the new mobile app, use the trees API directly: `POST /api/trees/get` with `{ location_id: <plot_id> }` to get trees for a plot, and compute counts client-side or via a dedicated analytics endpoint.

---

## Step 3 — Site selection flow (new app)

```
App launch
  └── Load sites list
        └── GET /api/locations?type=site&ancestor_id=2&offset=0&limit=50
              └── Show paginated site list

User selects a site (taps a row)
  └── Store selected site's location_id
  └── Load plots for site
        └── GET /api/locations/hierarchy?parent_id=<site_location_id>
              └── Show plot list

User selects a plot
  └── Store selected plot's location_id
  └── Load trees for plot
        └── POST /api/trees/get  body: { filters: [{ columnField: "location_id", value: <plot_location_id> }] }
```

---

## Backend work required

| Task | Endpoint | Priority |
|---|---|---|
| ~~New paginated flat-list endpoint~~ | `GET /api/locations?type=site&ancestor_id=X&offset=X&limit=Y` | ✅ Done |
| ~~Extend repo to support descendant query~~ | `locationsRepo.getDescendants(ancestorId, type, offset, limit)` | ✅ Done |
| (Optional) Add `plot_details` fields inline to hierarchy response | `GET /api/locations/hierarchy?parent_id=X&include_details=true` | Nice to have — avoids per-plot detail fetches |

---

## Cleanup — once new app ships

Once the new mobile app is deployed and the old app is retired:

1. Remove `POST /sites/get` compatibility shim from `siteController.ts` + `sitesRepo.ts`
2. Remove `POST /plots/get` compatibility shim from `plotController.ts` + `plotRepo.ts`
3. Remove entire `siteRoutes.ts` and `plotRoutes.ts` files
4. Remove `SiteRepository` and `PlotRepository` classes
5. Drop old `Site` and `Plot` Sequelize models
6. Schedule drop of `_archived_sites`, `_archived_plots` tables (3 months post-cutover)

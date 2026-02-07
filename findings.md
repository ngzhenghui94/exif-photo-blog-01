# Findings & Scratchpad

## Architecture Analysis for Map View

### Existing Architecture
- **Framework:** Next.js 15 (App Router).
- **Database:** Postgres (via `pg` and direct SQL queries).
- **Photo Data:** Stored in `photos` table. Includes `latitude` and `longitude` columns.
- **Routing:** `/` (Home), `/grid`, `/feed`, `/p/[photoId]`, `/admin`.
- **Data Fetching:** Server Components fetch data using `src/photo/db/query.ts` and pass it to Client Components.
- **Styling:** Tailwind CSS.

### Proposed Architecture for Map View

1.  **Route:** `/map`
    - Top-level route for easy access.
    - File: `src/app/map/page.tsx`.

2.  **Data Fetching:**
    - New Query Function: `getPhotosForMap` in `src/photo/db/query.ts`.
    - **Optimization:** Select only necessary fields (`id`, `url`, `latitude`, `longitude`, `taken_at_naive`, `aspect_ratio`) to minimize payload.
    - **Filtering:** `WHERE hidden IS NOT TRUE AND latitude IS NOT NULL AND longitude IS NOT NULL`.

3.  **Map Implementation (shadcn-map / React Leaflet):**
    - **Dependencies:** `leaflet`, `react-leaflet`, `@types/leaflet`.
    - **Component:** `src/components/Map.tsx` (Client Component).
    - **UI/UX:**
        - Full-screen or large container map.
        - Markers for each photo.
        - Popups showing a thumbnail (`url`), title/date, and link to `/p/[photoId]`.
    - **Integration:** "shadcn-map" suggests a specific styling/component structure. We will implement a map component using `react-leaflet` that aligns with the project's design system (Tailwind).

4.  **Integration Points:**
    - **Navigation:** Add "Map" link to the main navigation (likely in `src/components/SiteGrid.tsx` or `src/photo/PhotoGridSidebar.tsx`).
    - **Middleware:** Ensure `/map` is publicly accessible (similar to `/grid`).

5.  **Dependencies to Install:**
    - `leaflet`
    - `react-leaflet`
    - `@types/leaflet`

### Questions / Risky Assumptions
- **Clustering:** If there are thousands of photos, we might need `react-leaflet-cluster`. For V1, we will start without it or simple marker rendering.
- **Map Tiles:** We need a tile provider. OpenStreetMap (OSM) is free but requires attribution. Mapbox requires a key. We'll default to OSM for the prototype.
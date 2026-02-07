# Mission Progress

Mission: Implement a Map View for the photography app using shadcn-map. The map should visualize photos based on their EXIF GPS data.

## Status Log
- **[Date]**: Started mission. Analyzed codebase and identified `photos` table has geospatial data (`latitude`, `longitude`).
- **[Date]**: Proposed architecture: `/map` route, `getPhotosForMap` query, and `react-leaflet` implementation.
- **[Date]**: Next steps: Create the map page and components.

## Checklist
- [x] Analyze codebase for geospatial data availability.
- [x] Design Map View Architecture. (Completed in findings.md)
- [ ] Create `getPhotosForMap` query in `src/photo/db/query.ts`.
- [ ] Install dependencies (`leaflet`, `react-leaflet`, `@types/leaflet`).
- [ ] Create `Map` component (`src/components/Map.tsx`).
- [ ] Create `/map` page (`src/app/map/page.tsx`).
- [ ] Add Map link to navigation.
- [ ] Verify functionality.
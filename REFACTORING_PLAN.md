# Frontend Refactoring Plan: PickYourFlat

## Overview
Refactor the frontend codebase to improve maintainability and scalability using:
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Proper folder structure** with types, utils, hooks, and constants

## Phases

---

### Phase 1: Project Structure & Types
**Goal:** Establish folder structure and centralize types.

**Changes:**
```
frontend/src/
├── components/
│   ├── PropertyCard/
│   │   ├── PropertyCard.tsx
│   │   └── index.ts
│   ├── PropertyModal/
│   ├── FilterSort/
│   ├── CompareView/
│   ├── CompareButton/
│   ├── MapView/
│   └── common/           # Reusable UI (icons, buttons)
├── hooks/                # Custom hooks (empty for now)
├── stores/               # Zustand stores (empty for now)
├── types/
│   └── index.ts          # All TypeScript types
├── utils/                # Helper functions (empty for now)
├── constants/            # Static data, config (empty for now)
├── App.tsx
├── main.tsx
└── index.css
```

**Files to create:**
- `src/types/index.ts` - Move `Property`, `PropertyMetadata`, `FilterState`, `SortOption`, `BHKFilter`, `PriceRange` here
- `src/components/common/icons/` - Extract inline SVGs

**Files to modify:**
- All component files - Update import paths for types
- `data.ts` - Import types from `types/index.ts` instead of defining them

**Verification:**
- Run `npm run build` - should compile without errors
- Run `npm run dev` - app should function identically

---

### Phase 2: Utilities & Constants
**Goal:** Extract business logic and hardcoded data from components.

**Create `src/utils/propertyHelpers.ts`:**
```typescript
// Move from App.tsx:
- extractPrice(priceStr: string): number | null
- extractYear(possessionStr: string): number | null
- matchesBHK(property, bhkFilters): boolean
- matchesCity(property, cityFilters): boolean
- matchesLocality(property, localityFilters): boolean
- matchesBuilder(property, builderFilters): boolean
- matchesPossessionYear(property, yearFilters): boolean
- matchesPriceRange(property, rangeFilters): boolean
```

**Create `src/utils/markdownParser.ts`:**
```typescript
// Move from PropertyModal.tsx:
- renderMarkdownToHtml(text: string): string
```

**Create `src/constants/filterOptions.ts`:**
```typescript
// Move from FilterSort.tsx:
- priceRanges
- possessionYears
- bhkOptions
- cityOptions
- localityOptions
- builderOptions
```

**Verification:**
- Run `npm run build`
- Test all filters still work correctly
- Test property modal displays content correctly

---

### Phase 3: Tailwind CSS Setup & Migration
**Goal:** Replace custom CSS with Tailwind utility classes.

**Setup Steps:**
1. Install dependencies: `npm install -D tailwindcss postcss autoprefixer`
2. Run `npx tailwindcss init -p`
3. Configure `tailwind.config.js` with custom colors (purple gradient theme)
4. Update `index.css` with Tailwind directives

**Migration Strategy (one component at a time):**
1. `index.css` - Keep reset, add Tailwind base
2. `App.tsx` + `App.css` → Tailwind classes
3. `PropertyCard.tsx` + `PropertyCard.css` → Tailwind classes
4. `FilterSort.tsx` + `FilterSort.css` → Tailwind classes
5. `PropertyModal.tsx` + `PropertyModal.css` → Tailwind classes
6. `CompareView.tsx` + `CompareView.css` → Tailwind classes
7. `CompareButton.tsx` + `CompareButton.css` → Tailwind classes
8. `MapView.tsx` + `MapView.css` → Tailwind classes

**Custom Theme (tailwind.config.js):**
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#667eea',
        dark: '#5568d3',
      },
      secondary: '#764ba2',
    },
  },
}
```

**Files to delete after migration:**
- All `.css` files except `index.css`

**Verification:**
- Visual comparison before/after each component
- Responsive design still works (test on mobile breakpoints)
- Hover/active states preserved

---

### Phase 4: Zustand State Management
**Goal:** Replace props drilling with centralized state.

**Create `src/stores/usePropertyStore.ts`:**
```typescript
interface PropertyStore {
  // Filters
  filters: FilterState
  sortBy: SortOption
  setFilters: (filters: FilterState) => void
  setSortBy: (sort: SortOption) => void
  clearFilters: () => void
  toggleFilter: (filterType, value) => void  // Generic toggle

  // Compare
  compareList: Property[]
  isCompareOpen: boolean
  addToCompare: (property: Property) => void
  removeFromCompare: (id: string) => void
  toggleCompare: (property: Property) => void
  setCompareOpen: (open: boolean) => void
  isInCompare: (id: string) => boolean

  // Modal
  selectedProperty: Property | null
  isModalOpen: boolean
  openModal: (property: Property) => void
  closeModal: () => void

  // View
  viewMode: 'grid' | 'map'
  setViewMode: (mode: 'grid' | 'map') => void

  // Computed
  filteredProperties: Property[]  // Derived from filters
}
```

**Files to modify:**
- `App.tsx` - Remove all useState, use store
- `FilterSort.tsx` - Use store instead of props
- `CompareView.tsx` - Use store instead of props
- `CompareButton.tsx` - Use store instead of props
- `PropertyCard.tsx` - Use store for compare actions
- `PropertyModal.tsx` - Use store for modal state

**Benefits:**
- Remove 15+ props being passed through components
- Single source of truth for app state
- Easier to add new features

**Verification:**
- All filter combinations work
- Compare list persists across view changes
- Modal opens/closes correctly
- No console errors

---

### Phase 5: Custom Hooks
**Goal:** Extract reusable logic into hooks.

**Create `src/hooks/useClickOutside.ts`:**
```typescript
// Extract from FilterSort.tsx (lines 97-109)
// Reusable for any dropdown/modal
```

**Create `src/hooks/useFilteredProperties.ts`:**
```typescript
// Combines filtering + sorting logic
// Uses propertyHelpers utilities
// Returns filtered, sorted properties
```

**Files to modify:**
- `FilterSort.tsx` - Use `useClickOutside` hook
- `CompareView.tsx` - Use `useClickOutside` hook (for dropdown)

**Verification:**
- Dropdowns close on outside click
- Filtering still works correctly

---

### Phase 6: Component Cleanup
**Goal:** Final cleanup and dead code removal.

**Tasks:**
1. Remove unused `onAddMore` prop from `CompareView.tsx`
2. Extract SVG icons to `components/common/icons/`
3. Create reusable `Dropdown` component (used in FilterSort, CompareView)
4. Simplify toggle functions in FilterSort with generic handler
5. Add proper TypeScript strict mode checks
6. Remove any `// eslint-disable` comments if possible

**Files to create:**
- `src/components/common/icons/GridIcon.tsx`
- `src/components/common/icons/MapIcon.tsx`
- `src/components/common/icons/CompareIcon.tsx`
- `src/components/common/icons/CloseIcon.tsx`
- `src/components/common/Dropdown/Dropdown.tsx`

**Verification:**
- Run `npm run lint` - no warnings
- Run `npm run build` - clean build
- Full manual test of all features

---

## File Summary

### Files to Create
| Path | Purpose |
|------|---------|
| `src/types/index.ts` | Centralized TypeScript types |
| `src/utils/propertyHelpers.ts` | Filtering/parsing utilities |
| `src/utils/markdownParser.ts` | Markdown to HTML conversion |
| `src/constants/filterOptions.ts` | Static filter data |
| `src/stores/usePropertyStore.ts` | Zustand global state |
| `src/hooks/useClickOutside.ts` | Click outside detection |
| `src/hooks/useFilteredProperties.ts` | Filtering logic hook |
| `src/components/common/icons/*.tsx` | Reusable icon components |
| `src/components/common/Dropdown/` | Reusable dropdown component |
| `tailwind.config.js` | Tailwind configuration |
| `postcss.config.js` | PostCSS configuration |

### Files to Delete (after Phase 3)
- `src/App.css`
- `src/PropertyCard.css`
- `src/PropertyModal.css`
- `src/FilterSort.css`
- `src/CompareView.css`
- `src/CompareButton.css`
- `src/MapView.css`

### Files to Heavily Modify
- `src/App.tsx` - Remove business logic, use Zustand
- `src/FilterSort.tsx` - Use Zustand, Tailwind, extracted constants
- `src/CompareView.tsx` - Use Zustand, Tailwind, remove dead props
- `src/data.ts` - Import types instead of defining

---

## Verification Strategy

### After Each Phase
1. Run `npm run build` - must pass without errors
2. Run `npm run lint` - should have no new warnings
3. Code review to ensure core functionality is preserved

### Code-Level Verification Checklist

**Functionality Preservation:**
- [ ] All component props and their types are maintained
- [ ] Event handlers (onClick, onChange, etc.) are correctly wired
- [ ] State updates trigger re-renders as expected
- [ ] Filter logic produces same results (compare before/after)
- [ ] Conditional rendering logic is preserved
- [ ] All imports resolve correctly

**Type Safety:**
- [ ] No TypeScript errors
- [ ] All function signatures match their usage
- [ ] Props interfaces are complete and accurate

**Build Verification:**
```bash
npm run lint    # No warnings
npm run build   # Clean production build
```

### Manual Testing (by user)
After each phase, the user can manually verify on localhost:3000:
- Filters work correctly
- Compare functionality works
- Modal opens/closes
- Map view displays markers
- Responsive layout adjusts

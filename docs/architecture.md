# Architecture Document

## Backend Architecture

### Overview

The backend is built with Express.js and follows a layered architecture with clear separation of concerns.

### CSV Processing Strategy

The dataset (~224MB, ~1M records) is loaded once at server startup using a streaming approach:

1. **Streaming Load:** The `csv-parser` library reads the file as a stream, processing one row at a time without loading the entire file into memory at once.

2. **Data Normalization:** During streaming, each row is transformed:
   - Dates are converted to timestamps for efficient range comparisons
   - Numeric fields are parsed to integers/floats
   - A precomputed `searchText` field combines customer name and phone (lowercased) for fast search
   - Tags are split into arrays

3. **In-Memory Storage:** Processed records are stored in a single array. This approach is acceptable for this assignment because:
   - The dataset is static (no updates during runtime)
   - Memory usage is predictable (~500MB for 1M records)
   - Query response times are extremely fast (no disk I/O per request)

4. **Filter Options Extraction:** Unique values for dropdown filters are collected during the initial load.

### Data Pipeline

All queries follow a strict order (implemented in `salesService.js`):

```
Request → Search → Filter → Sort → Paginate → Response
```

This ensures:
- Consistent behavior regardless of parameter combination
- No duplicate filtering logic
- Predictable performance characteristics

### Folder Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers (thin layer)
│   │   └── salesController.js
│   ├── services/       # Business logic
│   │   └── salesService.js
│   ├── utils/          # Utilities
│   │   └── csvLoader.js
│   ├── routes/         # Route definitions
│   │   └── salesRoutes.js
│   └── index.js        # Entry point
├── data/               # Dataset
└── package.json
```

### API Design

- `GET /api/sales` - Main endpoint with query parameters for search, filters, sort, and pagination
- `GET /api/sales/filters` - Returns available filter options for frontend dropdowns

---

## Frontend Architecture

### Overview

React application using custom hooks for state management and functional components for UI.

### State Management

The `useSalesData` hook centralizes all data-related state:

- **Query State:** search term, filter values, sort options, current page
- **Data State:** transaction records, pagination info, loading/error status
- **Filter Options:** available values for filter dropdowns

State updates are debounced (300ms) to prevent excessive API calls during typing.

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| SearchBar | Text input for customer name/phone search |
| FilterPanel | Multi-select and range inputs for all filter types |
| SortDropdown | Dropdown to select sort field and order |
| TransactionTable | Display records in table format |
| Pagination | Previous/Next navigation with page info |

### Data Flow

```
User Action
    ↓
Component calls hook method (updateSearch, updateFilters, etc.)
    ↓
Hook updates state and triggers API call
    ↓
API response updates data state
    ↓
Components re-render with new data
```

### Folder Structure

```
frontend/
├── src/
│   ├── components/     # UI components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API layer
│   ├── utils/          # Helper functions
│   └── App.jsx         # Main component
├── public/
└── package.json
```

---

## Module Responsibilities

### Backend Modules

| Module | Responsibility |
|--------|----------------|
| csvLoader.js | Stream CSV, normalize data, store in memory |
| salesService.js | Apply search, filter, sort, paginate pipeline |
| salesController.js | Parse request params, call service, send response |
| salesRoutes.js | Define route mappings |
| index.js | Initialize Express, load CSV, start server |

### Frontend Modules

| Module | Responsibility |
|--------|----------------|
| api.js | Build query strings, make fetch calls |
| useSalesData.js | Manage all query state, debounce API calls |
| formatters.js | Format currency and dates for display |
| Components | Render UI elements |

---

## Performance Considerations

1. **Startup Time:** CSV loading takes 5-10 seconds. Server only accepts requests after loading completes.

2. **Query Time:** In-memory filtering is fast (<100ms for most queries). Complex filter combinations may take longer.

3. **Memory Usage:** The processed dataset uses approximately 500MB of RAM. This is acceptable for a single-instance deployment.

4. **Frontend Debouncing:** 300ms debounce on search/filter changes prevents unnecessary API calls.


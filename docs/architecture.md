# Architecture Document

## System Overview

The system has two parts: a React frontend hosted on Vercel and an Express backend hosted on Render. The backend uses SQLite to store and query 1 million sales records efficiently.

```
Frontend (Vercel)  <--HTTP-->  Backend (Render)  <--SQL-->  SQLite DB
```

## Why SQLite?

Started with in-memory storage but hit deployment issues - loading 1M records needs 500MB+ RAM which exceeds free tier limits. Switched to SQLite because:

- Queries only fetch what's needed (10 rows per page)
- Memory usage stays low (~20MB)
- Database file can be hosted externally and downloaded once
- Works on any free hosting tier

## Backend Structure

```
backend/
├── src/
│   ├── index.js              # Express server setup
│   ├── controllers/
│   │   └── salesController.js    # Handle HTTP requests
│   ├── services/
│   │   └── salesService.js       # Build SQL queries
│   ├── routes/
│   │   └── salesRoutes.js        # Route definitions
│   └── utils/
│       └── database.js           # SQLite connection
├── scripts/
│   └── importCsv.js              # One-time CSV to SQLite import
└── data/
    └── sales.db                  # SQLite database (gitignored)
```

## Data Flow

1. User types in search or clicks a filter
2. Frontend debounces for 300ms then calls API
3. Backend builds SQL query with all params
4. SQLite runs query with indexes
5. Backend returns 10 rows + pagination info + stats
6. Frontend updates the table

## Query Pipeline

All requests go through this order:

1. **Search** - WHERE searchStr LIKE '%query%'
2. **Filters** - AND clauses for each active filter
3. **Stats** - COUNT, SUM aggregates on filtered data
4. **Sort** - ORDER BY selected column
5. **Paginate** - LIMIT 10 OFFSET (page-1)*10

## Frontend Structure

```
frontend/src/
├── App.jsx                 # Main layout
├── components/
│   ├── SearchBar.jsx       # Search input
│   ├── FilterBar.jsx       # Dropdown filters
│   ├── SortDropdown.jsx    # Sort selector
│   ├── StatsCards.jsx      # Summary numbers
│   ├── TransactionTable.jsx    # Data table
│   └── Pagination.jsx      # Page navigation
├── hooks/
│   └── useSalesData.js     # All state + API calls
└── services/
    └── api.js              # Fetch wrapper
```

## State Management

Using a custom hook instead of Redux or Zustand. The hook manages:

- Search term
- Filter selections
- Sort field and direction
- Current page
- Loading and error states
- Data from API

When any param changes, useEffect fires and calls the API.

## API Endpoints

**GET /api/sales**

Query params: search, customerRegion, gender, ageMin, ageMax, productCategory, tags, paymentMethod, dateFrom, dateTo, sortBy, sortOrder, page

Returns: { data: [], pagination: {}, stats: {} }

**GET /api/sales/filters**

Returns available options for each filter dropdown.

## Database Schema

Single table with indexes on commonly filtered columns:

- searchStr (for text search)
- customerRegion, gender, productCategory, paymentMethod (for filters)
- dateTs, age (for range queries)

## Edge Cases

- Empty results: Shows "No transactions found" message
- Invalid filters: Ignored, query still runs
- Network error: Shows error state with retry option
- Page out of range: Clamped to valid range

## Deployment

- Frontend on Vercel - just connects to GitHub and deploys
- Backend on Render - downloads SQLite DB from Dropbox on first start
- DB file too large for GitHub so it's hosted on Dropbox with direct download link

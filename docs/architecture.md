# Architecture Document

## Overview

This document explains the technical architecture, design decisions, and data flow of the TruEstate Sales Management System.

## System Architecture

```
┌─────────────────┐     HTTP      ┌─────────────────┐
│                 │    Requests   │                 │
│    Frontend     │ ────────────> │     Backend     │
│   (React/Vite)  │               │   (Express.js)  │
│                 │ <──────────── │                 │
└─────────────────┘     JSON      └─────────────────┘
                                          │
                                          │ In-Memory
                                          ▼
                                  ┌─────────────────┐
                                  │   Sales Data    │
                                  │   (1M Records)  │
                                  └─────────────────┘
```

## Backend Architecture

### Why In-Memory Storage?

The dataset is loaded into memory at server startup for these reasons:

1. **Performance**: In-memory filtering is extremely fast (~10-50ms for 1M records)
2. **Simplicity**: No database setup, configuration, or connection management
3. **Static Data**: The dataset doesn't change during runtime
4. **Assignment Requirement**: Instructions specified streaming CSV once at startup

Trade-offs:
- Uses ~500MB RAM for 1M records
- Data is lost on server restart (reloaded from CSV)
- Not suitable for datasets that need real-time updates

### Data Loading Pipeline

```
CSV File (224MB)
      │
      ▼
Stream with csv-parser (memory efficient)
      │
      ▼
Parse & Normalize Each Row:
  - Convert dates to timestamps
  - Parse numeric fields
  - Create search string (name + phone, lowercase)
  - Split tags into array
      │
      ▼
Store in Array + Collect Filter Options
      │
      ▼
Ready to Serve Requests
```

### Query Processing Pipeline

All requests follow this exact order:

```
1. SEARCH    → Filter by customer name or phone (case-insensitive)
      │
2. FILTER    → Apply all active filters:
      │         - Customer Region (multi-select)
      │         - Gender (multi-select)
      │         - Age Range (min-max)
      │         - Product Category (multi-select)
      │         - Tags (multi-select, match any)
      │         - Payment Method (multi-select)
      │         - Date Range (from-to)
      │
3. STATS     → Calculate totals from filtered results
      │
4. SORT      → Order by date/quantity/customerName
      │
5. PAGINATE  → Return 10 records for requested page
      │
      ▼
   Response
```

This order ensures:
- Search narrows down results first (most selective)
- Stats reflect total filtered data, not just current page
- Pagination happens last on final sorted data

### Folder Structure

```
backend/
├── src/
│   ├── index.js           # Entry point, server setup
│   ├── controllers/
│   │   └── salesController.js  # Request handlers
│   ├── services/
│   │   └── salesService.js     # Business logic, pipeline
│   ├── routes/
│   │   └── salesRoutes.js      # Route definitions
│   └── utils/
│       └── csvLoader.js        # CSV loading & parsing
├── data/
│   └── *.csv                   # Dataset (gitignored)
└── package.json
```

### Module Responsibilities

| Module | Purpose |
|--------|---------|
| `index.js` | Express setup, middleware, startup sequence |
| `salesController.js` | Parse query params, call service, send response |
| `salesService.js` | Data pipeline logic (search, filter, sort, paginate) |
| `csvLoader.js` | Stream CSV, normalize data, manage in-memory store |

## Frontend Architecture

### State Management

Using a custom hook (`useSalesData`) instead of external state library:

- Simpler for this scope
- All related state in one place
- Easy to understand data flow

### Component Structure

```
App
├── Sidebar (navigation UI)
├── Header
│   └── SearchBar
├── FilterBar (dropdown filters)
├── SortDropdown
├── StatsCards
├── TransactionTable
└── Pagination
```

### Data Flow

```
User Action (search/filter/sort/page)
        │
        ▼
useSalesData hook updates state
        │
        ▼
useEffect triggers (debounced 300ms)
        │
        ▼
API call to backend
        │
        ▼
Update data/pagination/stats state
        │
        ▼
Components re-render
```

### Folder Structure

```
frontend/
├── src/
│   ├── App.jsx            # Main component
│   ├── components/        # UI components
│   ├── hooks/
│   │   └── useSalesData.js    # State management
│   ├── services/
│   │   └── api.js             # API calls
│   └── utils/
│       └── formatters.js      # Display formatting
└── package.json
```

## API Design

### GET /api/sales

Returns paginated transactions with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search in name/phone |
| customerRegion | string | Comma-separated values |
| gender | string | Comma-separated values |
| ageMin, ageMax | number | Age range |
| productCategory | string | Comma-separated values |
| tags | string | Comma-separated values |
| paymentMethod | string | Comma-separated values |
| dateFrom, dateTo | string | Date range (YYYY-MM-DD) |
| sortBy | string | date, quantity, customerName |
| sortOrder | string | asc, desc |
| page | number | Page number (1-indexed) |

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "total": 50000,
    "page": 1,
    "totalPages": 5000,
    "pageSize": 10
  },
  "stats": {
    "totalUnits": 150000,
    "totalAmount": 5000000,
    "totalDiscount": 250000
  }
}
```

### GET /api/sales/filters

Returns available filter options.

```json
{
  "customerRegions": ["Central", "East", "North", "South", "West"],
  "genders": ["Female", "Male"],
  "productCategories": ["Beauty", "Clothing", "Electronics"],
  "tags": ["accessories", "beauty", ...],
  "paymentMethods": ["Cash", "Credit Card", ...]
}
```

## Edge Cases Handled

1. **Empty search results**: Returns empty array with pagination showing 0 total
2. **Invalid age range**: Filters with invalid numbers are ignored
3. **Invalid dates**: Date filters with invalid format are ignored
4. **Missing fields in data**: Default to empty string or 0
5. **Page out of range**: Clamped to valid range (1 to totalPages)
6. **Invalid sort field**: Falls back to 'date'

## Performance Considerations

1. **Debouncing**: Frontend waits 300ms before API call to avoid excessive requests
2. **Single pass filtering**: All filters applied in one iteration
3. **Pre-computed search field**: Combined name+phone string for faster search
4. **Timestamps for dates**: Numeric comparison faster than string parsing

## Deployment

- **Frontend**: Vercel (static hosting)
- **Backend**: Render/Railway (persistent Node.js server)

Backend needs persistent server (not serverless) to maintain data in memory.

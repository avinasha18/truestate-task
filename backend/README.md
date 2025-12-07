# TruEstate Backend

Express API server for the Sales Management System.

## Setup

```bash
npm install
npm run dev
```

The server runs on port 3001 and loads the CSV dataset on startup.

## API Endpoints

### GET /api/sales
Returns paginated transactions with search, filter, and sort options.

Query Parameters:
- `search` - Search by customer name or phone
- `customerRegion` - Filter by region (comma-separated)
- `gender` - Filter by gender (comma-separated)
- `ageMin`, `ageMax` - Age range filter
- `productCategory` - Filter by category (comma-separated)
- `tags` - Filter by tags (comma-separated)
- `paymentMethod` - Filter by payment method (comma-separated)
- `dateFrom`, `dateTo` - Date range filter
- `sortBy` - Sort field (date, quantity, customerName)
- `sortOrder` - Sort direction (asc, desc)
- `page` - Page number

### GET /api/sales/filters
Returns available filter options (regions, genders, categories, etc.)

## Structure

- `src/controllers/` - Request handlers
- `src/services/` - Business logic
- `src/routes/` - Route definitions
- `src/utils/` - Utilities (CSV loader)


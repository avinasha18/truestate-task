# TruEstate Backend

Express API server for the Sales Management System.

## Setup

1. Download the CSV dataset and place it in `data/truestate_assignment_dataset.csv`

2. Install and run:
```bash
npm install
npm start
```

Server starts on port 3001. CSV processing takes ~5-10 seconds for 1M records.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port |
| FRONTEND_URL | * | CORS allowed origin |
| DRIVE_FILE_ID | - | Google Drive file ID for auto-download |

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
- `dateFrom`, `dateTo` - Date range filter (YYYY-MM-DD)
- `sortBy` - Sort field: date, quantity, customerName
- `sortOrder` - Sort direction: asc, desc
- `page` - Page number (default: 1)

### GET /api/sales/filters

Returns available filter options for dropdowns.

### GET /health

Health check endpoint.

## Project Structure

```
backend/
├── src/
│   ├── index.js           # Entry point
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── routes/            # Route definitions
│   └── utils/             # CSV loader
├── data/                  # Dataset folder
└── package.json
```

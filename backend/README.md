# Backend

Express API server with SQLite database.

## Setup

```bash
npm install
npm run import   # First time only - converts CSV to SQLite
npm start
```

Runs on port 3001.

## Scripts

- `npm start` - Run server
- `npm run import` - Import CSV into SQLite database

## API

**GET /api/sales** - Get transactions with search, filters, sort, pagination

**GET /api/sales/filters** - Get available filter options

**GET /health** - Health check

## Environment Variables

- `PORT` - Server port (default: 3001)
- `DB_URL` - URL to download database if not present locally

## Structure

```
src/
├── index.js           # Server entry
├── controllers/       # Request handlers  
├── services/          # Query logic
├── routes/            # Route setup
└── utils/             # Database connection
```

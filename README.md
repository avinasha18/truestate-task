# TruEstate Sales Management System

## Overview

A full-stack retail sales management application that processes a large dataset (~1M records) efficiently. The backend streams the CSV once at startup and keeps data in memory for fast query processing. Frontend provides search, filtering, sorting, and pagination capabilities.

## Tech Stack

- **Backend:** Node.js, Express, csv-parser
- **Frontend:** React 19, Vite, Tailwind CSS
- **Data Processing:** In-memory with streaming CSV load

## Search Implementation Summary

Search is performed on a precomputed search field that combines customer name and phone number (lowercased). The search is case-insensitive and matches partial strings. Search filtering is the first step in the data pipeline before any other filters are applied.

## Filter Implementation Summary

Filters support multi-select (Customer Region, Gender, Product Category, Tags, Payment Method) and range-based (Age, Date) options. All filters are applied server-side in a single pass through the data. Multiple filters can be combined and work together with search and sorting.

## Sorting Implementation Summary

Three sort options are available: Date (newest/oldest first), Quantity (high/low), and Customer Name (A-Z/Z-A). Sorting is applied after search and filters but before pagination. The original dataset order is not modified; a sorted copy is created for each request.

## Pagination Implementation Summary

Results are paginated with 10 records per page. The API returns total count, current page, and total pages in the response. Pagination is the final step in the pipeline, slicing the sorted and filtered results.

## Setup Instructions

### 1. Download Dataset

Download the CSV file from the provided Google Drive link and place it in:
```
backend/data/truestate_assignment_dataset.csv
```

### 2. Backend

```bash
cd backend
npm install
npm start
```

Server starts on port 3001. CSV loading takes ~5-10 seconds.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on port 5173.

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repo to Vercel
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`
5. Deploy

### Backend (Render/Railway)

1. Push code to GitHub
2. Create new Web Service on Render or Railway
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Deploy

**Note:** Backend needs a persistent server (not serverless) to keep CSV data in memory.

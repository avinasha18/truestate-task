# TruEstate Sales Management System

## Overview

A retail sales management system built to handle 1 million transaction records. Uses SQLite for efficient querying without loading all data into memory. The frontend provides search, multi-select filters, sorting, and pagination - all processed server-side.

## Tech Stack

- **Backend:** Node.js, Express, SQLite (better-sqlite3)
- **Frontend:** React 19, Vite, Tailwind CSS
- **Icons:** Lucide React

## Search Implementation Summary

Search works on customer name and phone number fields. When a user types, the query is sent to the backend which runs a SQL LIKE query on a pre-indexed searchStr column. Results are case-insensitive and support partial matches. Search is always applied first before any filters.

## Filter Implementation Summary

Seven filter types are supported: Customer Region, Gender, Age Range, Product Category, Tags, Payment Method, and Date Range. Multi-select filters use SQL IN clauses, range filters use >= and <= comparisons. All filters combine with AND logic and are applied in a single SQL query for efficiency.

## Sorting Implementation Summary

Users can sort by Date (newest/oldest), Quantity (high/low), or Customer Name (A-Z). Sorting is handled via SQL ORDER BY clause. The sort is applied after search and filters but before pagination to ensure consistent results across pages.

## Pagination Implementation Summary

Results come back 10 at a time. The API uses SQL LIMIT and OFFSET for pagination. Response includes total count so the frontend can show page numbers. Changing pages keeps all search, filter, and sort settings intact.

## Setup Instructions

### Backend

```bash
cd backend
npm install
npm run import   # Only needed once - imports CSV to SQLite
npm start
```

Server runs on port 3001.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on port 5173.

### Live URLs

- Frontend: https://truestate-task.vercel.app
- Backend: https://truestate-task.onrender.com

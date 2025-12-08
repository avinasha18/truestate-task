# Frontend

React app built with Vite and Tailwind.

## Setup

```bash
npm install
npm run dev
```

Opens on port 5173.

## Build

```bash
npm run build
```

Output goes to `dist/` folder.

## Environment

Set `VITE_API_URL` to point to your backend:

```
VITE_API_URL=https://your-backend.onrender.com/api
```

## Structure

```
src/
├── App.jsx            # Main component
├── components/        # UI pieces
├── hooks/             # useSalesData hook
├── services/          # API calls
└── utils/             # Formatters
```

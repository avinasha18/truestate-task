import express from 'express';
import cors from 'cors';
import { loadCSV } from './utils/csvLoader.js';
import salesRoutes from './routes/salesRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Routes
app.use('/api/sales', salesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'TruEstate Sales API',
    endpoints: {
      sales: '/api/sales',
      filters: '/api/sales/filters',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  console.log('='.repeat(50));
  console.log('TruEstate Sales API - Starting...');
  console.log('='.repeat(50));
  
  const startTime = Date.now();
  
  try {
    await loadCSV();
    
    app.listen(PORT, '0.0.0.0', () => {
      const totalTime = Date.now() - startTime;
      console.log('='.repeat(50));
      console.log(`✓ Server ready on port ${PORT}`);
      console.log(`✓ Total startup time: ${totalTime}ms`);
      console.log('='.repeat(50));
    });
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
}

start();

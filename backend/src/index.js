import express from 'express';
import cors from 'cors';
import { initDB } from './utils/database.js';
import salesRoutes from './routes/salesRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

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
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

app.use('/api/sales', salesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'TruEstate Sales API',
    endpoints: { sales: '/api/sales', filters: '/api/sales/filters', health: '/health' }
  });
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Server error' });
});

async function start() {
  console.log('==================================================');
  console.log('TruEstate Sales API - Starting...');
  console.log('==================================================');
  
  try {
    await initDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server ready on port ${PORT}`);
      console.log('==================================================');
    });
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
}

start();

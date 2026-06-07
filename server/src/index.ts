import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSchema } from './db/init';
import { seedData } from './db/seed';
import { errorHandler } from './middleware/error';
import patientsRouter from './routes/patients';
import journalRouter from './routes/journal';
import dashboardRouter from './routes/dashboard';
import clinicianRouter from './routes/clinician';
import aiRouter from './routes/ai';
import questionnaireRouter from './routes/questionnaire';
import riskRouter from './routes/risk';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/patients', patientsRouter);
app.use('/api/journal', journalRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/clinician', clinicianRouter);
app.use('/api/ai', aiRouter);
app.use('/api/questionnaire', questionnaireRouter);
app.use('/api/risk', riskRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
initSchema();
seedData();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

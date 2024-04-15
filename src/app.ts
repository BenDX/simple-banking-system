import express from 'express';
import bodyParser from 'body-parser';
import accountRoutes from './routes/accountRoutes';

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', accountRoutes);

export default app;
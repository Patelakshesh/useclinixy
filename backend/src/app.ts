import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import v1Routes from './routes/v1';
import { errorHandler } from './middlewares/error.middleware';

const app: Express = express();

// Middlewares
app.use(helmet());
app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow non-browser clients
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://useclinixy.vercel.app',
      'https://useclinixy.online',
      process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : ''
    ];

    if (allowedOrigins.includes(origin) || origin.endsWith('.useclinixy.online')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  }, 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Basic route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Doctor SaaS API is running' });
});

// V1 Routes
app.use('/api/v1', v1Routes);

// Error handling middleware
app.use(errorHandler);

export default app;

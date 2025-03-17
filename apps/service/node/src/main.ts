import express from 'express';
import { postgraphile } from 'postgraphile';
import cors from 'cors';

import authMiddleware from './middlewares/authMiddleware';
import authRoutes from './routes/authRoutes';
import config from './config';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);

// Apply auth middleware before postgraphile
app.use(authMiddleware);

// Postgraphile middleware configuration
app.use(
  postgraphile(
    config.databaseUrl,
    'app_public',
    config.postgraphileOptions
  )
);

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.listen(Number(config.port), config.host, () => {
  console.log(`[ ready ] http://${config.host}:${config.port}`);
  console.log(`GraphiQL interface available at: http://${config.host}:${config.port}/graphiql`);
});

import express from 'express';
import { postgraphile } from 'postgraphile';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// PostgreSQL connection configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://admin:admin@localhost:5432/bootstrap-project';

// Postgraphile middleware configuration
app.use(
  postgraphile(
    DATABASE_URL,
    'public', // PostgreSQL schema to expose
    {
      watchPg: true, // Auto-update schema when database changes
      graphiql: true, // Enable GraphiQL interface
      enhanceGraphiql: true, // Add extra GraphiQL features
      retryOnInitFail: true, // Retry connection on failure
      dynamicJson: true, // Return JSON scalars as raw JSON
      setofFunctionsContainNulls: false, // Assume set-returning functions don't return nulls
      ignoreRBAC: false, // Respect PostgreSQL's role-based access control
      extendedErrors: ['hint', 'detail', 'errcode'], // Extended error information
      appendPlugins: [], // Add any additional plugins here
      graphileBuildOptions: {
        // Any build-time options
      },
    }
  )
);

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`GraphiQL interface available at: http://${host}:${port}/graphiql`);
});

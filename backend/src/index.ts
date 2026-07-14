import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import tasksRouter from './routes/tasks';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/tasks', tasksRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
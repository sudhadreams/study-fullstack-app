import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const config: sql.config = {
  user: getEnv('DB_USER'),
  password: getEnv('DB_PASSWORD'),
  server: getEnv('DB_HOST'),
  database: getEnv('DB_NAME'),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

export const getPool = async (): Promise<sql.ConnectionPool> => {
  const pool = await sql.connect(config);
  return pool;
};

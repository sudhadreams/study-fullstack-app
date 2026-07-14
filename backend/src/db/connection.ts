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

const dbHost = process.env.DB_HOST || process.env.DB_SERVER;
const dbName = process.env.DB_NAME || process.env.DB_DATABASE;

if (!dbHost) {
  throw new Error('Missing required environment variable: DB_HOST or DB_SERVER');
}

if (!dbName) {
  throw new Error('Missing required environment variable: DB_NAME or DB_DATABASE');
}

const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;

const baseConfig: sql.config = {
  user: getEnv('DB_USER'),
  password: getEnv('DB_PASSWORD'),
  server: dbHost,
  port: dbPort,
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

const config: sql.config = {
  ...baseConfig,
  database: dbName,
};

const masterConfig: sql.config = {
  ...baseConfig,
  database: 'master',
};

export const getPool = async (): Promise<sql.ConnectionPool> => {
  const pool = await sql.connect(config);
  return pool;
};

export const initializeDatabase = async (): Promise<void> => {
  const masterPool = await sql.connect(masterConfig);
  const sanitizedDbName = dbName.replace(/'/g, "''");
  await masterPool.request().query(
    `IF DB_ID('${sanitizedDbName}') IS NULL EXEC('CREATE DATABASE [${sanitizedDbName}]')`
  );
  await masterPool.close();

  const pool = await getPool();
  const sanitizedTableName = 'Tasks';
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT * FROM sys.tables WHERE name = '${sanitizedTableName}' AND schema_id = SCHEMA_ID('dbo')
    )
    BEGIN
      CREATE TABLE dbo.${sanitizedTableName} (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(255) NOT NULL,
        Completed BIT NOT NULL DEFAULT 0
      );
    END
  `);
  await pool.close();
};


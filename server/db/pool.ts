import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool | null {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.trim() === '' || databaseUrl.includes('username:password')) {
    return null;
  }

  if (!pool) {
    const isNeonOrSsl = databaseUrl.includes('neon.tech') || databaseUrl.includes('sslmode=') || process.env.NODE_ENV === 'production';
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: isNeonOrSsl ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]: Unexpected client error', err.message);
    });
  }

  return pool;
}

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const activePool = getPool();
  if (!activePool) {
    throw new Error('DATABASE_URL is not configured or contains placeholder credentials.');
  }
  return activePool.query<T>(text, params);
}

export async function checkDbConnection(): Promise<{
  connected: boolean;
  configured: boolean;
  version?: string;
  error?: string;
  tablesCount?: number;
  tablesReady?: boolean;
}> {
  const activePool = getPool();
  if (!activePool) {
    return {
      connected: false,
      configured: false,
      error: 'DATABASE_URL is not configured in server environment. Please set your Neon PostgreSQL connection string.',
    };
  }

  try {
    const res = await activePool.query<{ server_version: string }>('SELECT current_setting(\'server_version\') as server_version');
    const tableRes = await activePool.query<{ count: string }>(
      "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'restaurants', 'orders', 'menu_items')"
    );
    const tablesCount = parseInt(tableRes.rows[0]?.count || '0', 10);

    return {
      connected: true,
      configured: true,
      version: res.rows[0]?.server_version,
      tablesCount,
      tablesReady: tablesCount >= 4,
    };
  } catch (err: any) {
    return {
      connected: false,
      configured: true,
      error: err.message || 'Failed to connect to PostgreSQL database.',
    };
  }
}

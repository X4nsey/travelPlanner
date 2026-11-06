import net from 'node:net';
import path from 'node:path';
import fs from 'node:fs';
import { prisma } from './prisma';

function isPortReachable(port: number, host = '127.0.0.1', timeout = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(timeout);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, host, () => {
      socket.end();
      resolve(true);
    });
  });
}

let embeddedPgInstance: any = null;

export async function ensureDatabaseReady(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/travelplanner?schema=public';
  let parsedPort = 5432;
  let parsedHost = 'localhost';
  let parsedUser = 'postgres';
  let parsedPassword = 'postgres';
  let parsedDb = 'travelplanner';

  try {
    const url = new URL(dbUrl);
    parsedPort = url.port ? parseInt(url.port, 10) : 5432;
    parsedHost = url.hostname || 'localhost';
    parsedUser = decodeURIComponent(url.username || 'postgres');
    parsedPassword = decodeURIComponent(url.password || 'postgres');
    parsedDb = url.pathname.replace(/^\//, '') || 'travelplanner';
  } catch {
    // Fallback to defaults
  }

  const isLocal = parsedHost === 'localhost' || parsedHost === '127.0.0.1';
  const portOpen = await isPortReachable(parsedPort, isLocal ? '127.0.0.1' : parsedHost);

  if (!portOpen && isLocal && process.env.USE_EMBEDDED_PG_FALLBACK !== 'false') {
    console.log(`[Database] Внешний PostgreSQL на порту ${parsedPort} не обнаружен. Запуск встроенного PostgreSQL (embedded-postgres)...`);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const epModule: any = await import('embedded-postgres' as string);
      const EmbeddedPostgres = epModule.default || epModule;
      const dataDir = path.resolve(__dirname, '../../.pgdata');
      const isInitialized = fs.existsSync(path.join(dataDir, 'PG_VERSION'));

      // Clean stale postmaster.pid if previous process exited abruptly
      const pidFile = path.join(dataDir, 'postmaster.pid');
      if (fs.existsSync(pidFile)) {
        try {
          fs.unlinkSync(pidFile);
        } catch {
          // ignore
        }
      }

      embeddedPgInstance = new EmbeddedPostgres({
        databaseDir: dataDir,
        user: parsedUser,
        password: parsedPassword,
        port: parsedPort,
        persistent: true,
        initdbFlags: ['--encoding=UTF8', '--locale=C'],
      });

      if (!isInitialized) {
        await embeddedPgInstance.initialise();
      }
      await embeddedPgInstance.start();

      try {
        await embeddedPgInstance.createDatabase(parsedDb);
        console.log(`[Database] База данных "${parsedDb}" успешно создана.`);
      } catch {
        // Database already exists
      }
      console.log(`[Database] Встроенный PostgreSQL запущен на порту ${parsedPort}.`);
    } catch (err) {
      console.warn('[Database] Не удалось запустить embedded-postgres:', err);
    }
  }

  // Ensure schema tables exist
  await prisma.$connect();
  const regResult = await prisma.$queryRaw<{ reg: string | null }[]>`SELECT to_regclass('public."User"')::text as reg`;
  const tableExists = Boolean(regResult?.[0]?.reg);

  const applyMigrationFile = async (relativeMigrationPath: string) => {
    const migrationPath = path.resolve(__dirname, relativeMigrationPath);
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf-8');
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      for (const statement of statements) {
        try {
          await prisma.$executeRawUnsafe(statement);
        } catch (stmtErr: any) {
          if (!String(stmtErr?.message || '').includes('already exists')) {
            throw stmtErr;
          }
        }
      }
    }
  };

  if (!tableExists) {
    console.log('[Database] Таблицы не найдены, применяем начальную миграцию схемы...');
    await applyMigrationFile('../../prisma/migrations/20261030000000_init/migration.sql');
    console.log('[Database] Начальная миграция успешно применена.');
  }

  const favRegResult = await prisma.$queryRaw<{ reg: string | null }[]>`SELECT to_regclass('public."FavoriteCountry"')::text as reg`;
  const favTableExists = Boolean(favRegResult?.[0]?.reg);

  if (!favTableExists) {
    console.log('[Database] Применяем миграцию таблицы избранных стран (FavoriteCountry)...');
    await applyMigrationFile('../../prisma/migrations/20261105000000_add_favorite_countries/migration.sql');
    console.log('[Database] Миграция FavoriteCountry успешно применена.');
  }
}

export async function shutdownDatabase(): Promise<void> {
  await prisma.$disconnect();
  if (embeddedPgInstance) {
    try {
      await embeddedPgInstance.stop();
    } catch {
      // ignore
    }
  }
}

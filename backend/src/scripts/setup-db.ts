import dotenv from 'dotenv';
dotenv.config();

import { ensureDatabaseReady, shutdownDatabase } from '../lib/db-bootstrap';

async function main() {
  console.log('[Setup] Инициализация базы данных PostgreSQL и проверка миграций...');
  await ensureDatabaseReady();
  console.log('[Setup] База данных успешно подготовлена к работе!');
  await shutdownDatabase();
  process.exit(0);
}

main().catch((err) => {
  console.error('[Setup] Ошибка инициализации базы данных:', err);
  process.exit(1);
});

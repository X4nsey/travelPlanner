import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { ensureDatabaseReady, shutdownDatabase } from './lib/db-bootstrap';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await ensureDatabaseReady();

    const server = app.listen(PORT, () => {
      console.log(`🚀 [TravelPlanner Backend] Сервер запущен на http://localhost:${PORT}`);
    });

    const handleShutdown = async (signal: string) => {
      console.log(`\n[TravelPlanner Backend] Получен сигнал ${signal}. Завершение работы...`);
      server.close(async () => {
        await shutdownDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ [TravelPlanner Backend] Ошибка при запуске сервера:', error);
    process.exit(1);
  }
}

startServer();

import { createServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { prisma } from './config/prisma.js';
import { closeRedis } from './config/redis.js';
import { logger } from './utils/logger.js';

const app = createApp();
const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: config.frontendUrl,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('join:school', (schoolId: string) => {
    if (typeof schoolId === 'string' && schoolId.length > 0) {
      socket.join(`school:${schoolId}`);
    }
  });

  socket.on('disconnect', () => {
    logger.debug(`Socket disconnected: ${socket.id}`);
  });
});

export function emitToSchool(schoolId: string, event: string, payload: unknown): void {
  io.to(`school:${schoolId}`).emit(event, payload);
}

const server = httpServer.listen(config.port, () => {
  logger.info(`School Management API listening on http://localhost:${config.port} (${config.nodeEnv})`);
});

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, shutting down`);
  io.close();
  server.close(async () => {
    await prisma.$disconnect();
    await closeRedis();
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

export { app, io, httpServer, server };

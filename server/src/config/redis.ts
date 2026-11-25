import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { config } from './index.js';

let redisConnection: Redis | null | undefined;

/**
 * Redis is optional in local development. Callers get null and can fall back
 * to synchronous work instead of crashing the API.
 */
export function getRedis(): Redis | null {
  if (redisConnection !== undefined) return redisConnection;

  if (!config.redisUrl) {
    redisConnection = null;
    return null;
  }

  redisConnection = new Redis(config.redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  redisConnection.on('error', (error: Error) => {
    if (!config.isTest) {
      console.error('[redis] connection error:', error.message);
    }
  });

  return redisConnection;
}

const queues = new Map<string, Queue>();

export function getQueue(name: string): Queue | null {
  const connection = getRedis();
  if (!connection) return null;

  const existing = queues.get(name);
  if (existing) return existing;

  const queue = new Queue(name, { connection });
  queues.set(name, queue);
  return queue;
}

export const QUEUE_NAMES = {
  notifications: 'notifications',
  emails: 'emails',
  sms: 'sms',
  feeReminders: 'fee-reminders',
  reports: 'reports',
} as const;

export async function closeRedis(): Promise<void> {
  for (const queue of queues.values()) {
    await queue.close();
  }
  queues.clear();

  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = undefined;
  }
}

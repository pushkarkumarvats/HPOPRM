import 'dotenv/config';
import { Worker, Queue, QueueEvents, JobsOptions } from 'bullmq';
import IORedis from 'ioredis';
import winston from 'winston';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const QUEUE_NAME = process.env.QUEUE_NAME || 'hedging-platform';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [new winston.transports.Console()],
  format: winston.format.json(),
});

// Deterministic matching simulation for orders
async function matchOrders(jobData: any) {
  // Very simple deterministic matching based on price-time priority
  const { orders } = jobData as { orders: Array<{ id: string; side: 'buy'|'sell'; price: number; qty: number; ts: number }>} ;
  const buys = orders.filter(o => o.side === 'buy').sort((a,b)=> b.price - a.price || a.ts - b.ts);
  const sells = orders.filter(o => o.side === 'sell').sort((a,b)=> a.price - b.price || a.ts - b.ts);
  const trades: Array<{ buyId: string; sellId: string; price: number; qty: number; ts: number }> = [];
  let i=0, j=0;
  while (i < buys.length && j < sells.length) {
    const b = buys[i];
    const s = sells[j];
    if (b.price >= s.price && b.qty > 0 && s.qty > 0) {
      const qty = Math.min(b.qty, s.qty);
      const price = Math.round(((b.price + s.price) / 2) * 100) / 100; // mid-price
      trades.push({ buyId: b.id, sellId: s.id, price, qty, ts: Date.now() });
      b.qty -= qty; s.qty -= qty;
      if (b.qty === 0) i++;
      if (s.qty === 0) j++;
    } else {
      // No cross
      if (b.price < s.price) break; else j++;
    }
  }
  return { trades };
}

// Forecast stub returns simple moving average projection
function forecastPrices(jobData: any) {
  const { history, horizonDays, commodity } = jobData as { history: number[]; horizonDays: number; commodity: string };
  const avg = history.reduce((a,b)=>a+b,0) / Math.max(history.length,1);
  const forecast = Array.from({length: horizonDays}).map((_,k)=> ({
    day: k+1,
    price: Math.round((avg * (1 + 0.001 * k)) * 100) / 100,
    lower: Math.round((avg * (1 - 0.02)) * 100) / 100,
    upper: Math.round((avg * (1 + 0.02)) * 100) / 100,
  }));
  return { commodity, forecast };
}

const worker = new Worker(QUEUE_NAME, async job => {
  logger.info({ event: 'job.received', name: job.name, id: job.id });
  switch (job.name) {
    case 'matchOrders':
      return await matchOrders(job.data);
    case 'forecast':
      return forecastPrices(job.data);
    default:
      logger.warn({ event: 'job.unknown', name: job.name });
      return null;
  }
}, { connection });

const queueEvents = new QueueEvents(QUEUE_NAME, { connection });
queueEvents.on('completed', ({ jobId, returnvalue }) => {
  logger.info({ event: 'job.completed', jobId, returnvalue });
});
queueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ event: 'job.failed', jobId, failedReason });
});

// Optional local producer for manual testing
if (process.env.WORKER_PRODUCER === 'true') {
  const queue = new Queue(QUEUE_NAME, { connection });
  (async () => {
    const opts: JobsOptions = { removeOnComplete: true, removeOnFail: true };
    await queue.add('forecast', { commodity: 'soybean', history: [4500, 4520, 4550, 4580], horizonDays: 7 }, opts);
    await queue.add('matchOrders', { orders: [
      { id: 'b1', side: 'buy', price: 4580, qty: 50, ts: Date.now()-1000 },
      { id: 's1', side: 'sell', price: 4570, qty: 30, ts: Date.now()-900 },
      { id: 's2', side: 'sell', price: 4580, qty: 25, ts: Date.now()-800 },
    ] }, opts);
    logger.info({ event: 'producer.seeded' });
  })().catch(err => logger.error(err));
}

logger.info({ event: 'worker.started', queue: QUEUE_NAME });

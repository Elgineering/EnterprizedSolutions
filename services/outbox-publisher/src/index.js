'use strict';
/* eee – Outbox Publisher (UNT)
   Polls Postgres core.outbox for unprocessed events and publishes to Kafka and SQS (LocalStack).
*/
// noinspection SqlNoDataSourceInspection

const { Pool } = require('pg');
const { Kafka, logLevel } = require('kafkajs');
const { SQSClient, CreateQueueCommand, GetQueueUrlCommand, SendMessageCommand } = require('@aws-sdk/client-sqs');

const env = (name, d) => process.env[name] || d;

const DB_HOST = env('DB_HOST', 'localhost');
const DB_PORT = parseInt(env('DB_PORT', '5432'), 10);
const DB_NAME = env('DB_NAME', 'eee_core_unt');
const DB_USER = env('DB_USER', 'postgres');
const DB_PASSWORD = env('DB_PASSWORD', 'postgres');

const KAFKA_BROKERS = env('KAFKA_BROKERS', 'localhost:9092').split(',');
const KAFKA_TOPIC = env('KAFKA_TOPIC', 'eee.events.core.unt');

const AWS_REGION = env('AWS_REGION', 'us-east-1');
const SQS_ENDPOINT = env('SQS_ENDPOINT', 'http://localhost:4566');
const SQS_QUEUE_NAME = env('SQS_QUEUE_NAME', 'eee-core-events-unt');

const POLL_INTERVAL_MS = parseInt(env('POLL_INTERVAL_MS', '1000'), 10);
const BATCH_SIZE = parseInt(env('BATCH_SIZE', '25'), 10);

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  max: 10,
});

const kafka = new Kafka({
  clientId: 'eee-outbox-publisher-unt',
  brokers: KAFKA_BROKERS,
  logLevel: logLevel.NOTHING,
});
const producer = kafka.producer({ allowAutoTopicCreation: false, idempotent: true });
const admin = kafka.admin();

const sqs = new SQSClient({
  region: AWS_REGION,
  endpoint: SQS_ENDPOINT,
  credentials: {
    accessKeyId: env('AWS_ACCESS_KEY_ID', 'test'),
    secretAccessKey: env('AWS_SECRET_ACCESS_KEY', 'test'),
  },
});

async function ensureKafkaTopic() {
  await admin.connect();
  try {
    const topics = await admin.listTopics();
    if (!topics.includes(KAFKA_TOPIC)) {
      await admin.createTopics({ topics: [{ topic: KAFKA_TOPIC, numPartitions: 1, replicationFactor: 1 }] });
      console.log(`[kafka] created topic ${KAFKA_TOPIC}`);
    }
  } finally {
    await admin.disconnect();
  }
}

async function ensureSqsQueue() {
  try {
    await sqs.send(new CreateQueueCommand({ QueueName: SQS_QUEUE_NAME }));
  } catch (e) {
    // ignore if already exists
  }
  const { QueueUrl } = await sqs.send(new GetQueueUrlCommand({ QueueName: SQS_QUEUE_NAME }));
  console.log(`[sqs] using queue ${SQS_QUEUE_NAME} at ${QueueUrl}`);
  return QueueUrl;
}

async function publish(row, queueUrl) {
  const key = row.aggregate_id;
  const value = JSON.stringify({
    id: row.id,
    aggregateType: row.aggregate_type,
    aggregateId: row.aggregate_id,
    eventType: row.event_type,
    payload: row.payload,
    occurredAt: row.occurred_at,
  });

  // Kafka publish
  await producer.send({
    topic: KAFKA_TOPIC,
    messages: [
      {
        key,
        value,
        headers: {
          'eee-aggregate-type': Buffer.from(row.aggregate_type),
          'eee-event-type': Buffer.from(row.event_type),
          'eee-idempotency-key': Buffer.from(row.idempotency_key || ''),
        },
      },
    ],
  });

  // SQS publish
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: value,
      MessageAttributes: {
        'eee-aggregate-type': { DataType: 'String', StringValue: row.aggregate_type },
        'eee-event-type': { DataType: 'String', StringValue: row.event_type },
        'eee-idempotency-key': { DataType: 'String', StringValue: row.idempotency_key || '' },
      },
    })
  );
}

async function pollOnce(queueUrl) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      // noinspection SqlNoDataSourceInspection
      /* language=SQL */ `SELECT id, aggregate_type, aggregate_id, event_type, payload, occurred_at, processed_at, idempotency_key
       FROM core.outbox
       WHERE processed_at IS NULL
       ORDER BY occurred_at ASC
       FOR UPDATE SKIP LOCKED
       LIMIT $1`,
      [BATCH_SIZE]
    );

    for (const row of rows) {
      try {
        await publish(row, queueUrl);
        await client.query(
          // noinspection SqlNoDataSourceInspection
          /* language=SQL */ 'UPDATE core.outbox SET processed_at = now(), error = NULL WHERE id = $1',
          [row.id]
        );
        console.log(`[outbox] processed ${row.id} (${row.event_type})`);
      } catch (err) {
        const msg = err && err.message ? err.message : String(err);
        console.error('[outbox] publish error', msg);
        await client.query(
          // noinspection SqlNoDataSourceInspection
          /* language=SQL */ 'UPDATE core.outbox SET error = $2 WHERE id = $1',
          [row.id, msg]
        );
      }
    }

    await client.query('COMMIT');
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    await client.query('ROLLBACK');
    console.error('[outbox] transaction error', msg);
  } finally {
    client.release();
  }
}

async function shutdown(code = 0) {
  try {
    clearInterval(timer);
  } catch {}
  try {
    await producer.disconnect();
  } catch {}
  try {
    await pool.end();
  } catch {}
  // eslint-disable-next-line no-process-exit
  process.exit(code);
}

let timer;
async function main() {
  console.log('Starting eee outbox publisher (UNT)');
  await ensureKafkaTopic();
  const queueUrl = await ensureSqsQueue();
  await producer.connect();

  // Simple liveness query to ensure DB is up
  await pool.query(
    // noinspection SqlNoDataSourceInspection
    /* language=SQL */ 'SELECT 1'
  );

  timer = setInterval(() => {
    pollOnce(queueUrl).catch((err) => {
      console.error('[outbox] poll error', err && err.message ? err.message : String(err));
    });
  }, POLL_INTERVAL_MS);

  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));
}

main().catch((e) => {
  console.error('Fatal error starting outbox publisher', e);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
});

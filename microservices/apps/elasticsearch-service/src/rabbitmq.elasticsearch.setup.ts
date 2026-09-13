import * as amqp from 'amqplib';
import { getRabbitMqUrl } from '@project-pc/common';

export async function setupElasticsearchRabbitMQ() {
  const connection = await amqp.connect(getRabbitMqUrl());
  const channel = await connection.createChannel();

  // Main queue for elasticsearch events
  // NOTE: arguments must stay in sync with the RMQ client declaration in
  // product-service (queueOptions: { durable: true }) — do NOT add
  // dead-letter args here or RabbitMQ will reject with PRECONDITION_FAILED.
  await channel.assertQueue('elasticsearch.main', {
    durable: true,
  });

  // Retry queue: holds failed messages for 5s, then dead-letters them back
  // into elasticsearch.main via the default exchange. Bounded retries are
  // enforced consumer-side using the x-death header count.
  await channel.assertQueue('elasticsearch.retry', {
    durable: true,
    arguments: {
      'x-message-ttl': 5000,
      'x-dead-letter-exchange': '',
      'x-dead-letter-routing-key': 'elasticsearch.main',
    },
  });

  // DLQ: parking lot for poison messages that exhausted all retries
  await channel.assertQueue('elasticsearch.dlq', {
    durable: true,
  });

  await channel.close();
  await connection.close();
}
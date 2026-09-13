import * as amqp from 'amqplib';
import { getRabbitMqUrl } from '@project-pc/common';

export async function setupProductRabbitMQ() {
  const connection = await amqp.connect(getRabbitMqUrl());

  const channel = await connection.createChannel();

  // ======================
  // Exchanges
  // ======================

  await channel.assertExchange('product.main.exchange', 'direct', {
    durable: true,
  });

  await channel.assertExchange('product.retry.exchange', 'direct', {
    durable: true,
  });

  await channel.assertExchange('product.dlx.exchange', 'direct', {
    durable: true,
  });

  // ======================
  // Main Queue
  // ======================

  await channel.assertQueue('product.main', {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'product.retry.exchange',
      'x-dead-letter-routing-key': 'product.retry',
    },
  });

  // ======================
  // Retry Queue (5s delay)
  // ======================

  await channel.assertQueue('product.retry', {
    durable: true,
    arguments: {
      'x-message-ttl': 5000,
      'x-dead-letter-exchange': 'product.main.exchange',
      'x-dead-letter-routing-key': 'product.main',
    },
  });

  // ======================
  // DLQ
  // ======================

  await channel.assertQueue('product.dlq', {
    durable: true,
  });

  // ======================
  // Bindings
  // ======================

  await channel.bindQueue(
    'product.main',
    'product.main.exchange',
    'product.main',
  );

  await channel.bindQueue(
    'product.retry',
    'product.retry.exchange',
    'product.retry',
  );

  await channel.bindQueue('product.dlq', 'product.dlx.exchange', 'product.dlq');
}
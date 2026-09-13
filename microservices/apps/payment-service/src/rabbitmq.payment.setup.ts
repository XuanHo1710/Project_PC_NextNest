import * as amqp from 'amqplib';
import { getRabbitMqUrl } from '@project-pc/common';

export async function setupPaymentRabbitMQ() {
  const connection = await amqp.connect(getRabbitMqUrl());

  const channel = await connection.createChannel();

  // ======================
  // Exchanges
  // ======================

  await channel.assertExchange('payment.main.exchange', 'direct', {
    durable: true,
  });

  await channel.assertExchange('payment.retry.exchange', 'direct', {
    durable: true,
  });

  await channel.assertExchange('payment.dlx.exchange', 'direct', {
    durable: true,
  });

  // ======================
  // Main Queue
  // ======================

  await channel.assertQueue('payment.main', {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'payment.retry.exchange',
      'x-dead-letter-routing-key': 'payment.retry',
    },
  });

  // ======================
  // Retry Queue (5s delay)
  // ======================

  await channel.assertQueue('payment.retry', {
    durable: true,
    arguments: {
      'x-message-ttl': 5000,
      'x-dead-letter-exchange': 'payment.main.exchange',
      'x-dead-letter-routing-key': 'payment.main',
    },
  });

  // ======================
  // DLQ
  // ======================

  await channel.assertQueue('payment.dlq', {
    durable: true,
  });

  // ======================
  // Bindings
  // ======================

  await channel.bindQueue(
    'payment.main',
    'payment.main.exchange',
    'payment.main',
  );

  await channel.bindQueue(
    'payment.retry',
    'payment.retry.exchange',
    'payment.retry',
  );

  await channel.bindQueue('payment.dlq', 'payment.dlx.exchange', 'payment.dlq');
}
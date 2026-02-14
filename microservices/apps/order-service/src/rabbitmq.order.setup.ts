import * as amqp from 'amqplib';

export async function setupOrderRabbitMQ() {
  const connection = await amqp.connect('amqp://admin:admin@localhost:5673');

  const channel = await connection.createChannel();

  // ======================
  // Exchanges
  // ======================

  await channel.assertExchange('order.main.exchange', 'direct', {
    durable: true,
  });

  await channel.assertExchange('order.retry.exchange', 'direct', {
    durable: true,
  });

  await channel.assertExchange('order.dlx.exchange', 'direct', {
    durable: true,
  });

  // ======================
  // Main Queue
  // ======================

  await channel.assertQueue('order.main', {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'order.retry.exchange',
      'x-dead-letter-routing-key': 'order.retry',
    },
  });

  // ======================
  // Retry Queue (5s delay)
  // ======================

  await channel.assertQueue('order.retry', {
    durable: true,
    arguments: {
      'x-message-ttl': 5000,
      'x-dead-letter-exchange': 'order.main.exchange',
      'x-dead-letter-routing-key': 'order.main',
    },
  });

  // ======================
  // DLQ
  // ======================

  await channel.assertQueue('order.dlq', {
    durable: true,
  });

  // ======================
  // Bindings
  // ======================

  await channel.bindQueue('order.main', 'order.main.exchange', 'order.main');

  await channel.bindQueue('order.retry', 'order.retry.exchange', 'order.retry');

  await channel.bindQueue('order.dlq', 'order.dlx.exchange', 'order.dlq');
}

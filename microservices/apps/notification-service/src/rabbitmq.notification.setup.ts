import * as amqp from 'amqplib';

export async function setupNotificationRabbitMQ() {
  const connection = await amqp.connect('amqp://admin:admin@localhost:5673');

  const channel = await connection.createChannel();

  // ======================
  // Exchanges
  // ======================

  await channel.assertExchange('notification.main.exchange', 'direct', {
    durable: true,
  });

  await channel.assertExchange('notification.retry.exchange', 'direct', {
    durable: true,
  });

  await channel.assertExchange('notification.dlx.exchange', 'direct', {
    durable: true,
  });

  // ======================
  // Main Queue
  // ======================

  await channel.assertQueue('notification.main', {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'notification.retry.exchange',
      'x-dead-letter-routing-key': 'notification.retry',
    },
  });

  // ======================
  // Retry Queue (5s delay)
  // ======================

  await channel.assertQueue('notification.retry', {
    durable: true,
    arguments: {
      'x-message-ttl': 5000,
      'x-dead-letter-exchange': 'notification.main.exchange',
      'x-dead-letter-routing-key': 'notification.main',
    },
  });

  // ======================
  // DLQ
  // ======================

  await channel.assertQueue('notification.dlq', {
    durable: true,
  });

  // ======================
  // Bindings
  // ======================

  await channel.bindQueue(
    'notification.main',
    'notification.main.exchange',
    'notification.main',
  );

  await channel.bindQueue(
    'notification.retry',
    'notification.retry.exchange',
    'notification.retry',
  );

  await channel.bindQueue(
    'notification.dlq',
    'notification.dlx.exchange',
    'notification.dlq',
  );
}

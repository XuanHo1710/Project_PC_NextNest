import * as amqp from 'amqplib';

export async function setupElasticsearchRabbitMQ() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL ?? 'amqp://admin:admin@rabbitmq:5672');
  const channel = await connection.createChannel();

  // Main queue for elasticsearch events
  await channel.assertQueue('elasticsearch.main', {
    durable: true,
  });

  await channel.close();
  await connection.close();
}
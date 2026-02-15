import * as amqp from 'amqplib';

export async function setupElasticsearchRabbitMQ() {
  const connection = await amqp.connect('amqp://admin:admin@localhost:5673');
  const channel = await connection.createChannel();

  // Main queue for elasticsearch events
  await channel.assertQueue('elasticsearch.main', {
    durable: true,
  });

  await channel.close();
  await connection.close();
}

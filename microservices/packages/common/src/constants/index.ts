// User Roles Constants
export const USER_ROLE = {
  GUEST: "guest",
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const MICROSERVICE = {
  AUTH_SERVICE: "AUTH_SERVICE",
  PRODUCT_SERVICE: "PRODUCT_SERVICE",
  REDIS_SERVICE: "REDIS_SERVICE",
  HISTORY_LOG_SERVICE: "HISTORY_LOG_SERVICE",
  CART_SERVICE: "CART_SERVICE",
  PAYMENT_SERVICE: "PAYMENT_SERVICE",
  ORDER_SERVICE: "ORDER_SERVICE",
  NOTIFICATION_SERVICE: "NOTIFICATION_SERVICE",
  SAGA_ORCHESTRATOR_SERVICE: "SAGA_ORCHESTRATOR_SERVICE",
  CHAT_SERVICE: "CHAT_SERVICE",
  ELASTICSEARCH_SERVICE: "ELASTICSEARCH_SERVICE",
} as const;

export type MicroserviceName = (typeof MICROSERVICE)[keyof typeof MICROSERVICE];

export const MICROSERVICE_PORT = {
  AUTH_SERVICE: 3001,
  PRODUCT_SERVICE: 3002,
  HISTORY_LOG_SERVICE: 3003,
  CART_SERVICE: 3004,
  PAYMENT_SERVICE: 3005,
  ORDER_SERVICE: 3006,
  NOTIFICATION_SERVICE: 3007,
  SAGA_ORCHESTRATOR_SERVICE: 3008,
  CHAT_SERVICE: 3009,
  ELASTICSEARCH_SERVICE: 3010,
} as const;

export type MicroservicePort =
  (typeof MICROSERVICE_PORT)[keyof typeof MICROSERVICE_PORT];

const DOCKER_SERVICE_HOSTS = {
  AUTH_SERVICE: "auth-service",
  PRODUCT_SERVICE: "product-service",
  REDIS_SERVICE: "redis",
  HISTORY_LOG_SERVICE: "history-log",
  CART_SERVICE: "cart-service",
  PAYMENT_SERVICE: "payment-service",
  ORDER_SERVICE: "order-service",
  NOTIFICATION_SERVICE: "notification-service",
  SAGA_ORCHESTRATOR_SERVICE: "saga-orchestration-service",
  CHAT_SERVICE: "chat-service",
  ELASTICSEARCH_SERVICE: "elasticsearch-service",
} as const;

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export function getServiceHost(name: keyof typeof MICROSERVICE): string {
  return (
    process.env[`${name}_HOST`] ??
    (IS_PRODUCTION ? DOCKER_SERVICE_HOSTS[name] : "localhost")
  );
}

export function getServicePort(name: keyof typeof MICROSERVICE_PORT): number {
  return Number(process.env[`${name}_PORT`] ?? MICROSERVICE_PORT[name]);
}

export function getRabbitMqUrl(): string {
  return (
    process.env.RABBITMQ_URL ??
    (IS_PRODUCTION
      ? "amqp://admin:admin@rabbitmq:5672"
      : "amqp://admin:admin@localhost:5672")
  );
}

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
} as const;

export type MicroserviceName = (typeof MICROSERVICE)[keyof typeof MICROSERVICE];

export const MICROSERVICE_PORT = {
  AUTH_SERVICE: 3001,
  PRODUCT_SERVICE: 3002,
} as const;

export type MicroservicePort =
  (typeof MICROSERVICE_PORT)[keyof typeof MICROSERVICE_PORT];

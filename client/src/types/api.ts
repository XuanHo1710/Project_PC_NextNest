export interface ApiEnvelope<T = unknown> {
  statusCode: number;
  message: string;
  data: T | null;
  error: string | null;
  timestamp: string;
}

export function asEnvelope<T>(payload: unknown): ApiEnvelope<T> {
  const env = payload as Partial<ApiEnvelope<T>> | null;
  if (
    !env ||
    typeof env !== 'object' ||
    typeof env.statusCode !== 'number' ||
    !('data' in env)
  ) {
    throw new Error('Phản hồi API không đúng định dạng');
  }
  return env as ApiEnvelope<T>;
}

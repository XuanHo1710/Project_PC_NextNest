import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = null;
    let isIntentional = false;

    if (exception instanceof HttpException) {
      isIntentional = true;
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        // NestJS thường trả về object { message, error, statusCode }
        message = (res as any).message || message;
        error = (res as any).error || null;
        // If statusCode is in the response body (from microservice), use it
        if ((res as any).statusCode) {
          status = (res as any).statusCode;
        }
      }
    } else if (exception && typeof exception === 'object') {
      // Handle RPC exceptions from microservices.
      // Over TCP/RMQ thrown errors arrive as plain objects:
      //  - { status: 'error', message }        (Nest default serializer)
      //  - { statusCode: number, message, error }
      const ex = exception as any;

      if (
        (typeof ex.status === 'number' && ex.status >= 400 && ex.status < 600) ||
        (typeof ex.statusCode === 'number' &&
          ex.statusCode >= 400 &&
          ex.statusCode < 600)
      ) {
        // Intentional RPC error carrying an HTTP-like status
        isIntentional = true;
        if (ex.message) message = ex.message;
        status = (ex.status ?? ex.statusCode) as number;
        if (ex.error) error = ex.error;

        if (ex.response && typeof ex.response === 'object') {
          message = ex.response.message || message;
          status = ex.response.statusCode || status;
          error = ex.response.error || error;
        }
      } else if (ex.status === 'error' && ex.message) {
        // Business rejection from a microservice without an HTTP status —
        // surface the original Vietnamese message instead of a generic 500.
        isIntentional = true;
        status = HttpStatus.BAD_REQUEST;
        message = ex.message;
      }
    }

    if (!isIntentional) {
      this.logger.error(
        `${request?.method} ${request?.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      message = 'Internal server error';
    }

    response.status(status).json({
      statusCode: status,
      message,
      data: null,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}

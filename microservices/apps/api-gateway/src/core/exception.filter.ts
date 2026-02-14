import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = null;

    if (exception instanceof HttpException) {
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
      // Handle RPC exceptions from microservices
      // These come as plain objects with { message, status/statusCode, error }
      const ex = exception as any;

      if (ex.message) {
        message = ex.message;
      }
      if (ex.status && typeof ex.status === 'number') {
        status = ex.status;
      } else if (ex.statusCode && typeof ex.statusCode === 'number') {
        status = ex.statusCode;
      }
      if (ex.error) {
        error = ex.error;
      }

      // Handle NestJS microservice error format: { response: { message, statusCode }, status }
      if (ex.response && typeof ex.response === 'object') {
        message = ex.response.message || message;
        status = ex.response.statusCode || status;
        error = ex.response.error || error;
      }
    } else if (typeof exception === 'string') {
      message = exception;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

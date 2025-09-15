import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = exception instanceof HttpException ? exception.message : 'Internal server error';

    // Try to extract detailed validation messages
    if (exception instanceof HttpException) {
      const res: any = exception.getResponse?.();
      const detailed = res?.message;
      if (Array.isArray(detailed) && detailed.length) {
        message = detailed.join('; ');
      } else if (typeof detailed === 'string') {
        message = detailed;
      }
    }

    response.status(status).json({
      status: false,
      message: message,
      data: null, 
    });
  }
}
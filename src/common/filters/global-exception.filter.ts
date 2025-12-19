// src/common/filters/global-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseCodes } from '../constants/response-codes';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ResponseCodes.INTERNAL_ERROR.code;
    let message = ResponseCodes.INTERNAL_ERROR.message as string;
    let details;

    if (exception instanceof HttpException) {
      const res = exception.getResponse() as any;
      status = exception.getStatus();

      // If it’s our AppException
      if (res.code && res.message) {
        code = res.code;
        message = res.message;
        details = res.details;
      } else if (typeof res === 'object') {
        message = res.message || message;
        details = res.details || details;
      } else if (typeof res === 'string') {
        message = res;
      }
    } else if (exception instanceof Error) {
      details = exception.stack;
    }

    response.status(status).json({
      success: false,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

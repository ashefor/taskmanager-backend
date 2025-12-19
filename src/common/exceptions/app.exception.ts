// src/common/exceptions/app.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseCode } from '../constants/response-codes';

export class AppException extends HttpException {
  constructor(
    public readonly responseCode: ResponseCode,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: any,
  ) {
    super(
      {
        success: false,
        code: responseCode.code,
        message: responseCode.message,
        details,
      },
      status,
    );
  }
}

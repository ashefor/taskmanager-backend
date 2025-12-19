// src/common/helpers/response.helper.ts
import { ResponseCodes, ResponseCodeKey } from '../constants/response-codes';

export class ResponseHelper {
  /**
   * ✅ Success Response
   */
  static success<T = any>(
    data: T,
    code: ResponseCodeKey = 'SUCCESS',
    messageOverride?: string
  ) {
    const responseCode = ResponseCodes[code];

    return {
      status: 'Success',
      code: responseCode.code,
      message: messageOverride || responseCode.message,
      ...(data && { data }),
    };
  }

  /**
   * ❌ Failure Response
   */
  static fail<T = any>(
    code: ResponseCodeKey,
    messageOverride?: string,
    data?: T,
  ) {
    const responseCode = ResponseCodes[code];

    return {
      status: 'Failed',
      code: responseCode.code,
      message: messageOverride || responseCode.message,
      ...(data && { data }),
    };
  }
}

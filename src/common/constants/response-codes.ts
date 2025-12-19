export const ErrorResponseCodes = {
  // ===== USER ERRORS (9200 - 9299) =====
  USER_NOT_FOUND: { code: 'USER-9200', message: 'User not found' },
  DUPLICATE_EMAIL: { code: 'USER-9201', message: 'Email already exists' },
  USER_ALREADY_VERIFIED: { code: 'USER-9202', message: 'Account already verified' },
  USER_NOT_VERIFIED: { code: 'USER-9203', message: 'Account not verified' },
  USER_CREATION_FAILED: { code: 'USER-9204', message: 'Failed to create user' },
  INVALID_USER_INPUT: { code: 'USER-9205', message: 'Invalid user data provided' },
  SAME_PASSWORD: { code: 'USER-9206', message: 'New password cannot be same as old password' },
  WRONG_PASSWORD: { code: 'USER-9207', message: 'Wrong password' },

  // ===== AUTH ERRORS (9300 - 9399) =====
  INVALID_CREDENTIALS: { code: 'AUTH-9300', message: 'Invalid email or password' },
  UNAUTHORIZED: { code: 'AUTH-9301', message: 'Unauthorized access' },
  FORBIDDEN: { code: 'AUTH-9302', message: 'You do not have permission to perform this action' },
  TOKEN_EXPIRED: { code: 'AUTH-9303', message: 'Token expired or invalid' },
  PASSWORD_RESET_FAILED: { code: 'AUTH-9304', message: 'Password reset failed' },
  ACCOUNT_LOCKED: { code: 'AUTH-9305', message: 'Account is locked' },

  // ===== TASK ERRORS (9400 - 9499) =====
  TASK_NOT_FOUND: { code: 'TASK-9400', message: 'Task not found' },
  TASK_CREATION_FAILED: { code: 'TASK-9401', message: 'Unable to create task' },
  TASK_UPDATE_FAILED: { code: 'TASK-9402', message: 'Unable to update task' },
  TASK_DELETE_FAILED: { code: 'TASK-9403', message: 'Unable to delete task' },
  TASK_DATE_LESS_THAN_15_MIN_NOW: { code: 'TASK-9404', message: 'Task due date must be at least 15 minutes from now' },
  COMMENT_NOT_FOUND: { code: 'TASK-9405', message: 'Comment not found' },

  // ===== VALIDATION & REQUEST ERRORS (9600 - 9699) =====
  VALIDATION_ERROR: { code: 'REQ-9600', message: 'Request validation failed' },
  BAD_REQUEST: { code: 'REQ-9601', message: 'Bad request' },
  MISSING_REQUIRED_FIELDS: { code: 'REQ-9602', message: 'Required fields missing' },

  // ===== SYSTEM ERRORS (9500 - 9599) =====
  INTERNAL_ERROR: { code: 'SYS-9500', message: 'Internal server error' },
  DATABASE_ERROR: { code: 'SYS-9501', message: 'Database operation failed' },
  SERVICE_UNAVAILABLE: { code: 'SYS-9502', message: 'Service temporarily unavailable' },
  UNKNOWN_ERROR: { code: 'SYS-9599', message: 'An unknown error occurred' },
} as const;

export const SuccessResponseCodes = {
  // ===== GENERAL SUCCESS =====
  SUCCESS: { code: '00', message: 'Success' },
  CREATED: { code: '01', message: 'Resource created successfully' },
  UPDATED: { code: '02', message: 'Resource updated successfully' },
  DELETED: { code: '03', message: 'Resource deleted successfully' },
  LOGGED_IN: { code: '04', message: 'Login successful' },
  LOGGED_OUT: { code: '05', message: 'Logout successful' },
  PASSWORD_RESET: { code: '06', message: 'Password reset successful' },
  USER_VERIFIED: { code: '07', message: 'User verified successfully' },
} as const;


export const ResponseCodes = {
  ...ErrorResponseCodes,
  ...SuccessResponseCodes,
} as const;

// ✅ Get all possible keys (union of both)
export type ResponseCodeKey = keyof typeof ResponseCodes;

// ✅ Type for a single response code entry
export type ResponseCode = (typeof ResponseCodes)[ResponseCodeKey];

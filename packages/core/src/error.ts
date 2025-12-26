import { AxiosError } from 'axios';

export interface MetaErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

export class MetaSDKError extends Error {
  code: number;
  type: string;
  action: string;
  recoverable: boolean;
  fbtrace_id?: string;

  constructor(message: string, code: number, type: string, action: string, recoverable: boolean) {
    super(message);
    this.name = 'MetaSDKError';
    this.code = code;
    this.type = type;
    this.action = action;
    this.recoverable = recoverable;
  }

  static fromAxiosError(error: AxiosError<MetaErrorResponse>): MetaSDKError {
    if (error.response?.data?.error) {
      const metaError = error.response.data.error;
      const normalized = this.normalizeError(metaError.code, metaError.message);
      
      const sdkError = new MetaSDKError(
        normalized.message,
        metaError.code,
        metaError.type,
        normalized.action,
        normalized.recoverable
      );
      
      sdkError.fbtrace_id = metaError.fbtrace_id;
      return sdkError;
    }

    return new MetaSDKError(
      error.message,
      0,
      'NetworkError',
      'Check your internet connection',
      true
    );
  }

  static normalizeError(code: number, originalMessage: string) {
    const errorMap: Record<number, { message: string; action: string; recoverable: boolean }> = {
      190: {
        message: 'Access token expired',
        action: 'Please re-authenticate',
        recoverable: true
      },
      10: {
        message: 'Permission not granted',
        action: 'Request permission in App Review',
        recoverable: false
      },
      100: {
        message: 'Invalid parameter',
        action: 'Check API documentation for correct parameters',
        recoverable: false
      },
      200: {
        message: 'Permission denied',
        action: 'User needs to grant this permission',
        recoverable: true
      },
      368: {
        message: 'Temporarily blocked',
        action: 'Wait before retrying',
        recoverable: true
      }
    };

    return errorMap[code] || {
      message: originalMessage,
      action: 'Check Meta API documentation',
      recoverable: false
    };
  }
}
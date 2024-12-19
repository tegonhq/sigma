/**
 * @internal
 * Error Metadata recieved in Failed XHR.
 */
interface XHRError {
  body?: {
    details?: string;
  };
  text?: string;
}

/**
 * Error Metadata associated with XHR.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export interface XHRErrorResponse<TError extends unknown = string[]> {
  /** Errors sent in body of Error response */
  errors?: TError;
  /** Text Message sent in body of Error response */
  message?: string;
  /**
   * Original Ajax Error response
   * (should only be used for Instrumentation purposes)
   */
  originalResponse?: XHRError;
  /** HTTP URL Endpoint for Ajax Request */
  reqUrl: string;
  /** HTTP Status Code except 2xx */
  resStatus?: number;
  /** Boolean that represents if errored due to Timeout */
  timeout: boolean;
}

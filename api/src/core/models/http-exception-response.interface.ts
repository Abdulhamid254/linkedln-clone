/* eslint-disable prettier/prettier */
export interface HttpExcetionResponse {
  statusCode: number;
  error: string;
}

export interface CustomExceptionResponse extends HttpExcetionResponse {
  path: string;
  method: string;
  timestamp: Date;
}

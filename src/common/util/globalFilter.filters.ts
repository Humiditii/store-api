import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

export interface IRpcException {
  message: string;
  status: number;
}

@Catch()
export class AllGlobalExceptionsFilter implements ExceptionFilter {

  private readonly logger: LoggerService = new Logger()

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let e = null

    if (exception?.response?.message){
      if (exception?.response?.message instanceof Array){
        e = exception?.response?.message.join(',')
      }else{
        e = exception?.response?.message
      }
    }

    const message =
      exception instanceof HttpException
        ? e ?? exception.message
        : 'God knows best';

    // log the error
    this.logger.error(message, JSON.stringify(exception.stack) || 'No stack trace available',)

    response.status(status ?? 500).json({
      message: message ,
      error: status ?? 500,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

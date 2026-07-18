import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((result: unknown) => {
        const isAlreadyWrapped =
          result &&
          typeof result === 'object' &&
          'success' in (result as Record<string, unknown>);

        const payload = isAlreadyWrapped
          ? (result as Record<string, unknown>).data
          : result;

        const message = isAlreadyWrapped
          ? (result as Record<string, unknown>).message
          : undefined;

        const meta = isAlreadyWrapped
          ? (result as Record<string, unknown>).meta
          : undefined;

        return {
          success: true,
          statusCode: response.statusCode,
          data: payload,
          ...(message !== undefined && { message }),
          ...(meta !== undefined && { meta }),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

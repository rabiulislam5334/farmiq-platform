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
        // Service already { success, data } বা { success, message } রিটার্ন করলে,
        // সেটা ভেঙে না ফেলে ভেতরের data-টাই wrap করি (double-nesting এড়াতে)
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

        return {
          success: true,
          statusCode: response.statusCode,
          data: payload,
          ...(message !== undefined && { message }),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

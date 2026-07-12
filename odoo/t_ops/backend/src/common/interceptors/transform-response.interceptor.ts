import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();

    return next.handle().pipe(
      map((data) => {
        // Skip transformation if headers are already sent or it's a file stream
        const contentType = response.getHeader?.('Content-Type');
        if (response.headersSent || (contentType && contentType.toString().includes('text/csv'))) {
          return data;
        }

        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          return data;
        }
        return { success: true, data };
      }),
    );
  }
}

import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { AppConfigService } from './config/app-config.service';

export const httpPlatformApiKeyInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  if (!request.url.includes('/api/platform/')) {
    return next(request);
  }

  const configService = inject(AppConfigService);
  const apiKey = configService.platformApiKey;

  if (!apiKey || request.headers.has('x-api-key')) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      'x-api-key': apiKey
    }
  }));
};

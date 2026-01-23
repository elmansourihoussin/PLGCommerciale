import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { PlatformAuthService } from './services/platform-auth.service';

export const httpPlatformApiKeyInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  if (!request.url.includes('/api/platform/')) {
    return next(request);
  }

  const platformAuthService = inject(PlatformAuthService);
  const token = platformAuthService.accessToken();

  if (!token || request.headers.has('Authorization')) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }));
};

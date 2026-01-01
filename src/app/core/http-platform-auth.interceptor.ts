import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlatformAuthService } from './services/platform-auth.service';

export const httpPlatformAuthInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(PlatformAuthService);
  const token = authService.accessToken();

  if (!token || request.headers.has('Authorization')) {
    return next(request);
  }

  if (!request.url.includes('/api/platform/')) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }));
};

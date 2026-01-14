import { inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

let refreshPromise: Promise<string | null> | null = null;

export const httpRefreshInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 && error.status !== 403) {
        return throwError(() => error);
      }

      const url = request.url;
      if (url.includes('/api/auth/login') || url.includes('/api/auth/register') || url.includes('/api/auth/refresh') || url.includes('/api/platform/')) {
        return throwError(() => error);
      }

      if (!refreshPromise) {
        refreshPromise = authService.refreshAccessToken()
          .finally(() => {
            refreshPromise = null;
          });
      }

      return from(refreshPromise).pipe(
        switchMap((token) => {
          if (!token) {
            authService.logout();
            router.navigate(['/auth/login']);
            return throwError(() => error);
          }
          const retryRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next(retryRequest);
        }),
        catchError((refreshError) => {
          authService.logout();
          router.navigate(['/auth/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};

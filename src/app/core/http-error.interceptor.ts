import { inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

export const httpErrorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isApiRequest = request.url.includes('/api/');
      if (error.status === 401 || error.status === 403) {
        const isPlatformRequest = request.url.includes('/api/platform/');
        if (!isPlatformRequest) {
          authService.logout();
          router.navigate(['/auth/login']);
        }
      } else if (isApiRequest && error.status === 404) {
        if (router.url !== '/errors/404') {
          router.navigate(['/errors/404']);
        }
      } else if (isApiRequest && (error.status === 0 || error.status >= 500)) {
        if (router.url !== '/errors/503') {
          router.navigate(['/errors/503']);
        }
      } else if (error.status >= 500) {
        console.error('Erreur serveur', error);
      }
      return throwError(() => error);
    })
  );
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PlatformAuthService } from '../services/platform-auth.service';

export const platformAuthGuard: CanActivateFn = () => {
  const authService = inject(PlatformAuthService);
  const router = inject(Router);
  const token = authService.accessToken();

  if (!token) {
    router.navigate(['/platform/login']);
    return false;
  }

  return true;
};

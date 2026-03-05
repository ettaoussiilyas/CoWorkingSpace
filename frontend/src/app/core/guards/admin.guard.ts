import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();
  if (user?.role === 'ROLE_ADMIN') return true;
  if (!user) router.navigate(['/login']);
  else router.navigate(['/']);
  return false;
};

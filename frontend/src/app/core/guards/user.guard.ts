import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const userGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();
  
  if (!user) {
    router.navigate(['/login']);
    return false;
  }
  
  if (user.role === 'ROLE_ADMIN') {
    router.navigate(['/admin']);
    return false;
  }
  
  return user.role === 'ROLE_USER';
};

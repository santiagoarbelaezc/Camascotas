import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard: Verificando estado de autenticación...');

  if (auth.isLoggedIn()) {
    console.log('AuthGuard: Usuario logueado, permite acceso.');
    return true;
  }

  console.warn('AuthGuard: Usuario NO logueado o token inválido. Redirigiendo a /login');
  return router.parseUrl('/login');
};

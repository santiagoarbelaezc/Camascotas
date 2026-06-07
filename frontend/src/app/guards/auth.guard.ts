import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  console.log('AuthGuard: Verificando estado de autenticación...');

  if (auth.isLoggedIn()) {
    console.log('AuthGuard: Usuario logueado, permite acceso.');
    return true;
  }

  console.warn('AuthGuard: Usuario NO logueado o token inválido. Redirigiendo a /login');
  toast.show('Debes iniciar sesión primero, o registrarte para personalizar tu cama', 'warning', 5000);
  return router.parseUrl('/login');
};

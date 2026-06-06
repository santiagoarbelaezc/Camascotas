import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'asistente',
    loadComponent: () => import('./pages/asistente/asistente.component').then(m => m.AsistenteComponent)
  },
  {
    path: 'nosotros',
    loadComponent: () => import('./components/nosotros/nosotros.component').then(m => m.NosotrosComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos.component').then(m => m.ProductosComponent)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contacto/contacto.component').then(m => m.ContactoComponent)
  },
  {
    path: 'personalizar-cama',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/personalizar-cama/personalizar-cama.component').then(m => m.PersonalizarCamaComponent)
  },
  {
    path: 'mis-camas',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/mis-camas/mis-camas.component').then(m => m.MisCamasComponent)
  },
  {
    path: 'compra/muebles-mascotas/:slugId',
    loadComponent: () => import('./pages/descripcion/descripcion.component').then(m => m.DescripcionComponent)
  },
  // ─── Dashboard Admin (Protegido) ──────────────────────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/views/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/dashboard/views/admin-productos/admin-productos.component').then(m => m.AdminProductosComponent)
      },
      {
        path: 'categorias',
        loadComponent: () => import('./pages/dashboard/views/admin-categorias/admin-categorias-view.component').then(c => c.AdminCategoriasComponent)
      },
      {
        path: 'stats',
        loadComponent: () => import('./pages/dashboard/views/admin-stats/admin-stats.component').then(m => m.AdminStatsComponent)
      },
      {
        path: 'personalizar',
        loadComponent: () => import('./pages/dashboard/views/personalizar-web/personalizar-web.component').then(m => m.PersonalizarWebComponent)
      },
      {
        path: 'camas-disenadas',
        loadComponent: () => import('./pages/dashboard/views/admin-camas-personalizadas/admin-camas-personalizadas.component').then(m => m.AdminCamasPersonalizadasComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/dashboard/views/admin-usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];


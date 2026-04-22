import { Routes } from '@angular/router';

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
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
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
    path: 'producto/:id/:slug',
    loadComponent: () => import('./pages/descripcion/descripcion.component').then(m => m.DescripcionComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

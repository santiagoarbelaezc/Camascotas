import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AuthService, Usuario } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  sidebarCollapsed = false;
  currentPageTitle = 'Panel Principal';
  usuario: Usuario | null = null;

  private pageTitles: Record<string, string> = {
    '/dashboard':            'Panel Principal',
    '/dashboard/productos':  'Gestión de Productos',
    '/dashboard/categorias': 'Gestión de Categorías',
  };

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.usuario = this.auth.getUsuario();

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: any) => e.urlAfterRedirects)
    ).subscribe(url => {
      this.currentPageTitle = this.pageTitles[url] ?? 'Admin';
    });

    this.currentPageTitle = this.pageTitles[this.router.url] ?? 'Admin';
  }

  get usuarioInicial(): string {
    return this.usuario?.nombre?.charAt(0).toUpperCase() ?? 'A';
  }

  logout(): void {
    if (confirm('¿Deseas cerrar sesión?')) {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }
}

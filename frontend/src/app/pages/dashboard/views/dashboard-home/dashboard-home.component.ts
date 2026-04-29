import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, Usuario } from '../../../../services/auth.service';
import { ProductoAdminService } from '../../../../services/producto-admin.service';
import { CategoriasService } from '../../../../services/categorias.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent implements OnInit {
  usuario: Usuario | null = null;
  totalProductos = 0;
  totalCategorias = 0;

  constructor(
    private auth: AuthService,
    private productosService: ProductoAdminService,
    private categoriasService: CategoriasService
  ) {}

  ngOnInit(): void {
    this.usuario = this.auth.getUsuario();

    this.productosService.getAll().subscribe({
      next: p => this.totalProductos = p.length,
      error: () => {}
    });

    this.categoriasService.getCategorias().subscribe({
      next: c => this.totalCategorias = c.length,
      error: () => {}
    });
  }
}

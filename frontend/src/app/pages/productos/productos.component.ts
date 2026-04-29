import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuCategoriasComponent } from '../../components/menu-categorias/menu-categorias.component';
import { ProductosListComponent } from '../../components/productos-list/productos-list.component';
import { PorQueElegirnosComponent } from '../../components/por-que-elegirnos/por-que-elegirnos.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule, 
    MenuCategoriasComponent, 
    ProductosListComponent,
    PorQueElegirnosComponent
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent {
  menuVisible = false;

  toggleMenu(): void {
    this.menuVisible = !this.menuVisible;
  }

  cerrarMenu(): void {
    this.menuVisible = false;
  }

  cerrarMenuSiEsMovil(): void {
    if (window.innerWidth <= 1024) {
      this.cerrarMenu();
    }
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface CarruselItem {
  id: number;
  nombre: string;
  precio: number;
  desde: boolean;
  imagen: string;
  imagenHover: string;
  categoria: string;
  colores: string[];
}

@Component({
  selector: 'app-carrusel-destacados',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrusel-destacados.component.html',
  styleUrl: './carrusel-destacados.component.css'
})
export class CarruselDestacadosComponent {
  @Input() titulo: string = 'Nuestros Favoritos';
  @Input() subtitulo: string = 'Los muebles más amados por peluditos y sus familias';
  @Input() todosLosItems: CarruselItem[] = [];

  tabs = ['Todos', 'Perros', 'Gatos', 'Accesorios'];
  tabActivo = 'Todos';

  get itemsFiltrados(): CarruselItem[] {
    if (this.tabActivo === 'Todos') return this.todosLosItems;
    return this.todosLosItems.filter(i => i.categoria === this.tabActivo);
  }

  setTab(tab: string) {
    this.tabActivo = tab;
  }

  formatPrecio(precio: number): string {
    return '$' + precio.toLocaleString('es-CO') + ' COP';
  }
}

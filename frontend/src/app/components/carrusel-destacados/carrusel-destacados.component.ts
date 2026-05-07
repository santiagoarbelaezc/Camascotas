import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

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

  /** How many items to show initially before "Ver más" */
  @Input() itemsIniciales: number = 6;

  tabs = ['Todos', 'Perros', 'Gatos'];
  tabActivo = 'Todos';
  expandido = false;

  constructor(private router: Router) {}

  get itemsFiltradosPorTab(): CarruselItem[] {
    if (this.tabActivo === 'Todos') return this.todosLosItems;
    return this.todosLosItems.filter(i => i.categoria === this.tabActivo);
  }

  get itemsFiltrados(): CarruselItem[] {
    const filtrados = this.itemsFiltradosPorTab;
    if (this.expandido) return filtrados;
    return filtrados.slice(0, this.itemsIniciales);
  }

  get hayMasItems(): boolean {
    return this.itemsFiltradosPorTab.length > this.itemsIniciales && !this.expandido;
  }

  get itemsOcultos(): number {
    return Math.max(0, this.itemsFiltradosPorTab.length - this.itemsIniciales);
  }

  setTab(tab: string): void {
    this.tabActivo = tab;
    this.expandido = false; // Reset on tab change
  }

  toggleExpandir(): void {
    this.expandido = !this.expandido;
  }

  formatPrecio(precio: number): string {
    return '$' + precio.toLocaleString('es-CO') + ' COP';
  }

  verProducto(item: CarruselItem): void {
    const slug = item.nombre.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    this.router.navigateByUrl(`/compra/muebles-mascotas/${slug}-p${item.id}`);
  }
}

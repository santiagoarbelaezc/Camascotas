import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ConfiguracionService } from '../../services/configuracion.service';

export interface CarruselItem {
  id: number;
  nombre: string;
  precio: number;
  desde: boolean;
  imagen: string;
  imagenHover: string;
  categoria: string;
  colores: string[];
  badge?: string;
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
  @Input() itemsIniciales: number = 6;

  tabs = ['Todos', 'Perros', 'Gatos'];
  tabActivo = 'Todos';

  mostrarPrecios$;

  // Mouse Drag Scrolling State
  private isMouseDown = false;
  private startX = 0;
  private scrollLeft = 0;

  private availableBadges = [
    'Nuevo',
    'Más Vendido',
    'Últimas Unidades',
    'Exclusivo',
    'A Medida',
    'Recomendado',
    'Tendencia'
  ];

  constructor(private router: Router, private configuracionService: ConfiguracionService) {
    this.mostrarPrecios$ = this.configuracionService.mostrarPrecios$;
  }

  get itemsFiltradosPorTab(): CarruselItem[] {
    if (this.tabActivo === 'Todos') return this.todosLosItems;
    return this.todosLosItems.filter(i => i.categoria === this.tabActivo);
  }

  get itemsFiltrados(): CarruselItem[] {
    return this.itemsFiltradosPorTab;
  }

  setTab(tab: string): void {
    this.tabActivo = tab;
  }

  getBadge(item: CarruselItem, index: number): string {
    if (item.badge) return item.badge;
    const idx = Math.abs(Number(index)) || 0;
    return this.availableBadges[idx % this.availableBadges.length];
  }

  getBadgeClass(badge: string): string {
    switch (badge) {
      case 'Últimas Unidades':
        return 'badge-ultimas';
      case 'Más Vendido':
        return 'badge-vendido';
      case 'Exclusivo':
        return 'badge-exclusivo';
      case 'A Medida':
        return 'badge-amedida';
      case 'Recomendado':
        return 'badge-recomendado';
      case 'Tendencia':
        return 'badge-tendencia';
      default:
        return 'badge-nuevo';
    }
  }

  // Desplazamiento por Arrastre con Mouse
  onMouseDown(e: MouseEvent, target: HTMLElement): void {
    this.isMouseDown = true;
    this.startX = e.pageX - target.offsetLeft;
    this.scrollLeft = target.scrollLeft;
  }

  onMouseLeave(): void {
    this.isMouseDown = false;
  }

  onMouseUp(): void {
    this.isMouseDown = false;
  }

  onMouseMove(e: MouseEvent, target: HTMLElement): void {
    if (!this.isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - target.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    target.scrollLeft = this.scrollLeft - walk;
  }

  formatPrecio(precio: number): string {
    return '$' + precio.toLocaleString('es-CO') + ' COP';
  }

  verProducto(item: CarruselItem): void {
    if (this.isMouseDown) return;
    const slug = item.nombre.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    this.router.navigateByUrl(`/compra/muebles-mascotas/${slug}-p${item.id}`);
  }
}

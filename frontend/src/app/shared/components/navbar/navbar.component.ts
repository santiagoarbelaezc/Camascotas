import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductosService, Producto } from '../../../services/productos.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuAbierto = false;
  scrolled = false;
  grupoAbierto = false; // Para el dropdown en mobile
  
  // Lógica de búsqueda
  searchTerm: string = '';
  suggestions: string[] = [];
  allProducts: Producto[] = [];
  showSuggestions: boolean = false;

  constructor(
    private router: Router,
    private productosService: ProductosService
  ) {}

  ngOnInit() {
    this.productosService.getProductos().subscribe((prods: Producto[]) => {
      this.allProducts = prods;
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 10;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.menuAbierto) {
      const target = event.target as HTMLElement;
      const isClickInside = target.closest('.mobile-menu') || target.closest('.hamburger');
      if (!isClickInside) {
        this.closeMenu();
      }
    }
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    if (window.innerWidth > 768 && this.menuAbierto) {
      this.closeMenu();
    }
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
    if (this.menuAbierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      this.grupoAbierto = false;
    }
  }

  toggleGrupo(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.grupoAbierto = !this.grupoAbierto;
  }

  closeMenu(): void {
    this.menuAbierto = false;
    this.grupoAbierto = false;
    document.body.style.overflow = '';
  }

  navigateAndClose(): void {
    this.closeMenu();
  }

  // --- MÉTODOS DE BÚSQUEDA ---

  normalizarTexto(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  onSearchInput() {
    if (!this.searchTerm.trim()) {
      this.suggestions = [];
      this.showSuggestions = false;
      return;
    }

    const termNorm = this.normalizarTexto(this.searchTerm);
    this.suggestions = this.allProducts
      .filter(p => this.normalizarTexto(p.nombre).includes(termNorm))
      .map(p => p.nombre)
      .slice(0, 5); // Máximo 5 sugerencias

    this.showSuggestions = this.suggestions.length > 0;
  }

  selectSuggestion(s: string) {
    this.searchTerm = s;
    this.performSearch();
  }

  performSearch() {
    if (this.searchTerm.trim()) {
      this.showSuggestions = false;
      this.router.navigate(['/productos'], { queryParams: { busqueda: this.searchTerm } });
      this.closeMenu();
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.suggestions = [];
    this.showSuggestions = false;
  }
}

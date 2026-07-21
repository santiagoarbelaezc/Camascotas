import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService, Producto } from '../../services/productos.service';
import { ProductoSeleccionadoService } from '../../services/producto-seleccionado.service';
import { ConfiguracionService } from '../../services/configuracion.service';

interface GadgetInfo {
  texto: string;
  tipo: string;
}

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos-list.component.html',
  styleUrl: './productos-list.component.css'
})
export class ProductosListComponent implements OnInit {
  productos: Producto[] = [];
  cargando = true;
  terminoBusqueda: string | null = null;
  mostrarPrecios$;

  // Paginación: Limitado a 8 productos por página
  currentPage = 1;
  itemsPerPage = 8;

  private readonly GADGETS: GadgetInfo[] = [
    { texto: 'Últimas Unidades', tipo: 'urgente' },
    { texto: 'Nuevo', tipo: 'nuevo' },
    { texto: 'Exclusivo', tipo: 'exclusivo' },
    { texto: 'Recomendado', tipo: 'destacado' },
    { texto: 'Edición Limitada', tipo: 'limitado' },
    { texto: 'Diseño Premium', tipo: 'premium' },
    { texto: 'Tendencia Pet', tipo: 'tendencia' },
    { texto: 'Favorito', tipo: 'favorito' }
  ];

  constructor(
    private productosService: ProductosService,
    private productoSeleccionadoService: ProductoSeleccionadoService,
    private route: ActivatedRoute,
    private router: Router,
    private configuracionService: ConfiguracionService
  ) {
    this.mostrarPrecios$ = this.configuracionService.mostrarPrecios$;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      this.cargando = true;
      this.currentPage = 1; // Reset a la primera página al cambiar filtros
      const catId = params['categoria_id'] ? +params['categoria_id'] : undefined;
      const subCatId = params['subcategoria_id'] ? +params['subcategoria_id'] : undefined;
      this.terminoBusqueda = params['busqueda'] || null;

      setTimeout(() => {
        this.productosService.getProductos(catId, subCatId).subscribe((prods: Producto[]) => {
          if (this.terminoBusqueda) {
            const termNormalizado = this.normalizarTexto(this.terminoBusqueda);
            this.productos = prods.filter(p => 
              this.normalizarTexto(p.nombre).includes(termNormalizado) ||
              this.normalizarTexto(p.descripcion).includes(termNormalizado)
            );
          } else {
            this.productos = prods;
          }
          this.cargando = false;
        });
      }, 250);
    });
  }

  obtenerGadget(index: number): GadgetInfo {
    const gadgetIndex = Math.abs(index) % this.GADGETS.length;
    return this.GADGETS[gadgetIndex];
  }

  get totalPages(): number {
    return Math.ceil(this.productos.length / this.itemsPerPage);
  }

  get paginatedProducts(): Producto[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.productos.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  normalizarTexto(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  limpiarBusqueda() {
    this.router.navigate(['/productos'], { queryParams: { busqueda: null }, queryParamsHandling: 'merge' });
  }

  verProducto(prod: Producto): void {
    this.productoSeleccionadoService.setProducto(prod);
    const slug = prod.nombre.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    this.router.navigateByUrl(`/compra/muebles-mascotas/${slug}-p${prod.id}`);
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }
}

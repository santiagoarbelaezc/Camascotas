import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService, Producto } from '../../services/productos.service';
import { ProductoSeleccionadoService } from '../../services/producto-seleccionado.service';

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

  constructor(
    private productosService: ProductosService,
    private productoSeleccionadoService: ProductoSeleccionadoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cargando = true;
      const catId = params['categoria_id'] ? +params['categoria_id'] : undefined;
      const subCatId = params['subcategoria_id'] ? +params['subcategoria_id'] : undefined;

      // Simulamos un retraso para mostrar elegancia en la carga
      setTimeout(() => {
        this.productosService.getProductos(catId, subCatId).subscribe(prods => {
          this.productos = prods;
          this.cargando = false;
        });
      }, 300);
    });
  }

  verProducto(prod: Producto): void {
    // Paso A: Guardar en el servicio
    this.productoSeleccionadoService.setProducto(prod);

    // Generar slug amigable
    const slug = prod.nombre.toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    // Paso B: Navegar instantáneamente
    this.router.navigate(['/producto', prod.id, slug]);
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }
}

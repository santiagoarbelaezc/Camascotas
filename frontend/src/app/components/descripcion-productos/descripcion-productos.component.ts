import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductosService, Producto } from '../../services/productos.service';
import { ProductoSeleccionadoService } from '../../services/producto-seleccionado.service';

@Component({
  selector: 'app-descripcion-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './descripcion-productos.component.html',
  styleUrl: './descripcion-productos.component.css'
})
export class DescripcionProductosComponent implements OnInit {
  producto: Producto | null = null;
  imagenPrincipal: string = '';
  zoomStyle: any = { display: 'none' };
  isCopied = false;

  @ViewChild('mainImageContainer') mainImageContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private productosService: ProductosService,
    private productoSeleccionadoService: ProductoSeleccionadoService
  ) {}

  ngOnInit(): void {
    // Escuchamos siempre los cambios en los parámetros de la URL
    // Esto asegura que si navegamos de un producto a otro (desde recomendados), el componente se actualice.
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.cargarProductoPorId(id);
      } else {
        // Si no hay ID en URL, intentamos ver si hay uno seleccionado en el servicio (caso poco probable pero por seguridad)
        this.productoSeleccionadoService.getProducto().subscribe(prod => {
          if (prod) {
            this.producto = prod;
            this.imagenPrincipal = prod.imagen;
          }
        });
      }
    });
  }

  private cargarProductoPorId(id: number): void {
    this.productosService.getProductos().subscribe(prods => {
      const found = prods.find(p => p.id === id);
      if (found) {
        this.producto = found;
        this.imagenPrincipal = found.imagen;
        // Hacemos scroll al inicio cuando cambia el producto
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  cambiarImagen(img: string): void {
    this.imagenPrincipal = img;
  }

  // Zoom Dinámico
  onImageMouseMove(event: MouseEvent): void {
    const container = this.mainImageContainer.nativeElement;
    const rect = container.getBoundingClientRect();
    
    // Calcular posición porcentual del mouse dentro del contenedor
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.zoomStyle = {
      display: 'block',
      'background-image': `url(${this.imagenPrincipal})`,
      'background-position': `${x}% ${y}%`,
      'background-size': '200%' // Zoom de 2x
    };
  }

  onImageMouseLeave(): void {
    this.zoomStyle = { display: 'none' };
  }

  generarEnlaceWhatsApp(): string {
    if (!this.producto) return '';
    const mensaje = `Hola Camascotas! Me interesa el producto *${this.producto.nombre}* con un precio de ${this.formatearPrecio(this.producto.precio)}. Me gustaría recibir más información.`;
    return `https://api.whatsapp.com/send?phone=573207793380&text=${encodeURIComponent(mensaje)}`;
  }

  copiarEnlace(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.isCopied = true;
      setTimeout(() => this.isCopied = false, 2000);
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }
}

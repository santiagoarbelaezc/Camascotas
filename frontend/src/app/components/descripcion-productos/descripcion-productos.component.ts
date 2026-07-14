import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductosService, Producto } from '../../services/productos.service';
import { ProductoSeleccionadoService } from '../../services/producto-seleccionado.service';
import { StatsService } from '../../services/stats.service';
import { ConfiguracionService } from '../../services/configuracion.service';

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
  mostrarPrecios$;
  
  // Estados para el nuevo diseño e-commerce
  isCopied = false;
  cantidad: number = 1;
  variantes: string[] = ['S (Mini/Gatos)', 'M (Mediano)', 'L (Grande)'];
  varianteSeleccionada: string = 'M (Mediano)';
  esFavorito: boolean = false;
  descripcionExpandida: boolean = false;

  @ViewChild('mainImageContainer') mainImageContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private productosService: ProductosService,
    private productoSeleccionadoService: ProductoSeleccionadoService,
    private statsService: StatsService,
    private configuracionService: ConfiguracionService
  ) {
    this.mostrarPrecios$ = this.configuracionService.mostrarPrecios$;
  }

  ngOnInit(): void {
    // Escuchamos siempre los cambios en los parámetros de la URL
    // Esto asegura que si navegamos de un producto a otro (desde recomendados), el componente se actualice.
    this.route.params.subscribe(params => {
      const slugId = params['slugId'];
      let id = null;

      if (slugId && slugId.includes('-p')) {
        id = +slugId.split('-p').pop();
      }

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
    // Resetear producto para mostrar el estado de carga (loader)
    this.producto = null;

    // Registrar vista del producto
    this.statsService.registrarVistaProducto(id).subscribe();

    this.productosService.getProductoById(id).subscribe({
      next: (found) => {
        this.producto = found;
        // Establecer imagen principal (la primera de la galería si existe, sino la imagen base)
        const firstImg = (found.imagenes && found.imagenes.length > 0) ? found.imagenes[0] : found.imagen;
        this.imagenPrincipal = this.getImagenUrl(firstImg);
        
        // Inicializar variantes específicas si el producto tiene colores o tipos
        if (found.colores && found.colores.length > 0) {
          this.varianteSeleccionada = 'Color: ' + found.colores[0];
          this.variantes = found.colores.map(c => 'Color: ' + c);
        } else {
          this.variantes = ['S (Mini/Gatos)', 'M (Mediano)', 'L (Grande)'];
          this.varianteSeleccionada = 'M (Mediano)';
        }
        this.cantidad = 1; // Resetear cantidad
        
        // Hacemos scroll al inicio cuando cambia el producto
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => console.error('Error cargando producto', err)
    });
  }

  cambiarImagen(img: string): void {
    this.imagenPrincipal = img;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder.jpg';
  }

  getImagenUrl(img: any): string {
    if (!img) return 'assets/images/placeholder.jpg';
    if (typeof img === 'string') return img;
    return img.imagen_url || 'assets/images/placeholder.jpg';
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
    const mostrarPrecios = this.configuracionService.mostrarPreciosActual;
    const precioTotalTexto = mostrarPrecios 
      ? ` con un valor total de ${this.formatearPrecio(this.producto.precio * this.cantidad)}` 
      : '';
    const mensaje = `Hola Camascotas! Me interesa el producto *${this.producto.nombre}* (${this.varianteSeleccionada}, Cantidad: ${this.cantidad})${precioTotalTexto}. Me gustaría recibir más información.`;
    return `https://api.whatsapp.com/send?phone=573207793380&text=${encodeURIComponent(mensaje)}`;
  }

  incrementarCantidad(): void {
    if (this.cantidad < 99) {
      this.cantidad++;
    }
  }

  decrementarCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  seleccionarVariante(v: string): void {
    this.varianteSeleccionada = v;
  }

  toggleFavorito(): void {
    this.esFavorito = !this.esFavorito;
  }

  toggleDescripcion(): void {
    this.descripcionExpandida = !this.descripcionExpandida;
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

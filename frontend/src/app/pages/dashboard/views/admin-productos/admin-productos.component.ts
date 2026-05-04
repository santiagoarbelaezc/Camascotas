import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoAdminService, ProductoAdmin } from '../../../../services/producto-admin.service';
import { CategoriasService, Categoria } from '../../../../services/categorias.service';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-productos.component.html',
  styleUrl: './admin-productos.component.css'
})
export class AdminProductosComponent implements OnInit {
  productos: ProductoAdmin[] = [];
  categorias: Categoria[]    = [];
  cargando = true;
  
  // Paginación
  paginaActual = 1;
  itemsPorPagina = 8;

  mostrarFormulario = false;
  guardando         = false;
  productoEditando: ProductoAdmin | null = null;

  form = {
    nombre:          '',
    descripcion:     '',
    precio:          0,
    desde:           false,
    subcategoria_id: '',
    colores:         ''
  };

  archivosSeleccionados: File[] = [];

  // Toast
  toastVisible = false;
  toastError   = false;
  toastMessage = '';

  constructor(
    private productosService: ProductoAdminService,
    private categoriasService: CategoriasService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.productosService.getAll().subscribe({
      next:  p  => { this.productos = p; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
    this.categoriasService.getCategorias().subscribe({
      next: c => this.categorias = c
    });
  }

  get productosPaginados(): ProductoAdmin[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin    = inicio + this.itemsPorPagina;
    return this.productos.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.productos.length / this.itemsPorPagina);
  }

  get paginas(): number[] {
    const total = this.totalPaginas;
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual = p;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  abrirFormulario(): void {
    this.productoEditando = null;
    this.form = { nombre: '', descripcion: '', precio: 0, desde: false, subcategoria_id: '', colores: '' };
    this.archivosSeleccionados = [];
    this.mostrarFormulario = true;
  }

  editar(prod: ProductoAdmin): void {
    this.productoEditando = prod;
    this.form = {
      nombre:          prod.nombre,
      descripcion:     prod.descripcion || '',
      precio:          prod.precio,
      desde:           !!prod.desde,
      subcategoria_id: String(prod.subcategoria_id),
      colores:         (prod.colores ?? []).join(', ')
    };
    this.archivosSeleccionados = [];
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.productoEditando  = null;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.archivosSeleccionados = Array.from(input.files);
    }
  }

  guardar(): void {
    if (!this.form.nombre.trim() || !this.form.precio || !this.form.subcategoria_id) {
      this.showToast('Completa los campos requeridos (*)', true);
      return;
    }
    
    if (this.form.precio < 0) {
      this.showToast('El precio no puede ser un valor negativo', true);
      this.form.precio = 0;
      return;
    }

    if (/^\d+$/.test(this.form.nombre.trim())) {
      this.showToast('El nombre del producto no puede ser solo números', true);
      return;
    }

    if (this.form.nombre.trim().length < 3) {
      this.showToast('El nombre debe tener al menos 3 caracteres', true);
      return;
    }

    if (!this.productoEditando && this.archivosSeleccionados.length === 0) {
      this.showToast('Debes seleccionar al menos una imagen para el nuevo producto', true);
      return;
    }

    const fd = new FormData();
    fd.append('nombre',          this.form.nombre);
    fd.append('descripcion',     this.form.descripcion);
    fd.append('precio',          String(this.form.precio));
    fd.append('desde',           this.form.desde ? '1' : '0');
    fd.append('subcategoria_id', this.form.subcategoria_id);
    fd.append('colores',         this.form.colores);

    this.archivosSeleccionados.forEach(f => fd.append('imagenes[]', f));

    this.guardando = true;
    const req = this.productoEditando
      ? this.productosService.actualizar(this.productoEditando.id, fd)
      : this.productosService.crear(fd);

    req.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarFormulario();
        this.cargarDatos();
        this.showToast(this.productoEditando ? 'Producto actualizado' : 'Producto creado');
      },
      error: (err) => {
        this.guardando = false;
        this.showToast(err?.error?.error ?? 'Error al guardar el producto', true);
      }
    });
  }

  confirmarEliminar(prod: ProductoAdmin): void {
    if (!confirm(`¿Eliminar "${prod.nombre}"? Esta acción no se puede deshacer.`)) return;

    this.productosService.eliminar(prod.id).subscribe({
      next:  () => { this.cargarDatos(); this.showToast('Producto eliminado'); },
      error: (err) => this.showToast(err?.error?.error ?? 'Error al eliminar', true)
    });
  }

  formatPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(precio);
  }

  private showToast(msg: string, isError = false): void {
    this.toastMessage = msg;
    this.toastError   = isError;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3500);
  }
}

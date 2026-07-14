import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentesService, ComponenteDinamico } from '../../../../services/componentes.service';
import { CategoriasService, Categoria } from '../../../../services/categorias.service';
import { ConfiguracionService } from '../../../../services/configuracion.service';

@Component({
  selector: 'app-personalizar-web',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personalizar-web.component.html',
  styleUrl: './personalizar-web.component.css'
})
export class PersonalizarWebComponent implements OnInit {
  componentes: ComponenteDinamico[] = [];
  categorias: Categoria[] = [];

  // Configuración Global
  mostrarPrecios = true;
  guardandoConfig = false;
  configToast = '';
  configToastError = false;
  configToastVisible = false;

  // Modales
  showModal = false;
  editingComponente: ComponenteDinamico | null = null;
  
  // Formulario del componente dinámico
  tipoSeleccionado = 'banner';
  activoSeleccionado = true;
  
  // Contenido dinámico según tipo
  contenido: any = {};
  
  // Auxiliares para listas dinámicas en el formulario
  nuevoTestimonio: any = { nombre: '', puesto: '', estrellas: 5, avatar: '', comentario: '' };
  nuevoFaq: any = { pregunta: '', respuesta: '' };
  nuevaGaleriaImg: any = { imageUrl: '', caption: '' };

  constructor(
    private componentesService: ComponentesService,
    private categoriasService: CategoriasService,
    private configuracionService: ConfiguracionService
  ) {}

  ngOnInit(): void {
    this.cargarComponentes();
    this.cargarCategorias();
    this.configuracionService.getMostrarPrecios().subscribe(val => this.mostrarPrecios = val);
  }

  toggleMostrarPrecios(): void {
    const nuevoValor = !this.mostrarPrecios;
    this.guardandoConfig = true;
    this.configuracionService.setMostrarPrecios(nuevoValor).subscribe({
      next: () => {
        this.guardandoConfig = false;
        this.mostrarPrecios = nuevoValor;
        this.showConfigToast(nuevoValor ? 'Precios visibles para los usuarios' : 'Precios ocultos correctamente');
      },
      error: () => {
        this.guardandoConfig = false;
        this.showConfigToast('Error al guardar la configuración', true);
      }
    });
  }

  private showConfigToast(msg: string, isError = false): void {
    this.configToast = msg;
    this.configToastError = isError;
    this.configToastVisible = true;
    setTimeout(() => this.configToastVisible = false, 3500);
  }

  cargarComponentes(): void {
    this.componentesService.getComponentes().subscribe({
      next: (res) => {
        this.componentes = res;
      },
      error: (err) => console.error('Error cargando componentes:', err)
    });
  }

  cargarCategorias(): void {
    this.categoriasService.getCategorias().subscribe({
      next: (res) => {
        this.categorias = res;
      },
      error: (err) => console.error('Error cargando categorias:', err)
    });
  }

  toggleActivo(comp: ComponenteDinamico): void {
    if (!comp.id) return;
    const nuevoEstado = comp.activo ? 0 : 1;
    this.componentesService.actualizarComponente(comp.id, { activo: nuevoEstado }).subscribe({
      next: () => {
        comp.activo = nuevoEstado === 1;
      },
      error: (err) => console.error('Error al cambiar visibilidad:', err)
    });
  }

  eliminarComponente(id?: number): void {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas eliminar esta sección de la Landing Page?')) {
      this.componentesService.eliminarComponente(id).subscribe({
        next: () => {
          this.componentes = this.componentes.filter(c => c.id !== id);
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

  moverArriba(index: number): void {
    if (index === 0) return;
    const temp = this.componentes[index];
    this.componentes[index] = this.componentes[index - 1];
    this.componentes[index - 1] = temp;
    this.guardarOrden();
  }

  moverAbajo(index: number): void {
    if (index === this.componentes.length - 1) return;
    const temp = this.componentes[index];
    this.componentes[index] = this.componentes[index + 1];
    this.componentes[index + 1] = temp;
    this.guardarOrden();
  }

  guardarOrden(): void {
    const ids = this.componentes.map(c => c.id).filter(id => id !== undefined) as number[];
    this.componentesService.reordenarComponentes(ids).subscribe({
      next: () => console.log('Nuevo orden guardado'),
      error: (err) => console.error('Error al guardar orden:', err)
    });
  }

  abrirNuevoModal(): void {
    this.editingComponente = null;
    this.tipoSeleccionado = 'banner';
    this.activoSeleccionado = true;
    this.inicializarContenido('banner');
    this.showModal = true;
  }

  abrirEditarModal(comp: ComponenteDinamico): void {
    this.editingComponente = comp;
    this.tipoSeleccionado = comp.tipo;
    this.activoSeleccionado = !!comp.activo;
    this.contenido = JSON.parse(JSON.stringify(comp.contenido || {}));
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.editingComponente = null;
  }

  onTipoChange(): void {
    this.inicializarContenido(this.tipoSeleccionado);
  }

  inicializarContenido(tipo: string): void {
    this.contenido = {};
    if (tipo === 'banner') {
      this.contenido = { imageUrl: '', descripcion: '', linkUrl: '', posicion: 'superior' };
    } else if (tipo === 'anuncio') {
      this.contenido = { badge: '', titulo1: '', descripcion1: '', titulo2: '', descripcion2: '', caracteristicas: '', textoBoton: '', linkBoton: '' };
    } else if (tipo === 'texto') {
      this.contenido = { titulo: '', texto: '', alineacion: 'center' };
    } else if (tipo === 'testimonios') {
      this.contenido = { titulo: 'Opiniones de nuestros clientes', subtitulo: 'Lo que dicen de nuestros muebles', testimonios: [] };
    } else if (tipo === 'faq') {
      this.contenido = { titulo: 'Preguntas Frecuentes', subtitulo: 'Resolvemos tus dudas', faqs: [] };
    } else if (tipo === 'galeria') {
      this.contenido = { titulo: 'Galería de fotos', subtitulo: 'Nuestras mascotas felices', imagenes: [] };
    } else if (tipo === 'carrusel_productos') {
      this.contenido = { titulo: 'Productos Destacados', subtitulo: 'Mira nuestros modelos', categoria: '' };
    }
  }

  // --- Subir imágenes ---
  subirImagen(event: any, callback: (url: string) => void): void {
    const file = event.target.files[0];
    if (!file) return;
    this.componentesService.subirImagen(file).subscribe({
      next: (res) => {
        callback(res.url);
      },
      error: (err) => console.error('Error al subir imagen:', err)
    });
  }

  subirBannerImg(event: any): void {
    this.subirImagen(event, (url) => { this.contenido.imageUrl = url; });
  }

  subirAvatarTestimonio(event: any): void {
    this.subirImagen(event, (url) => { this.nuevoTestimonio.avatar = url; });
  }

  subirGaleriaImg(event: any): void {
    this.subirImagen(event, (url) => { this.nuevaGaleriaImg.imageUrl = url; });
  }

  // --- Manejo de listas dinámicas ---
  agregarTestimonio(): void {
    if (!this.contenido.testimonios) this.contenido.testimonios = [];
    if (this.nuevoTestimonio.nombre) {
      this.contenido.testimonios.push({ ...this.nuevoTestimonio });
      this.nuevoTestimonio = { nombre: '', puesto: '', estrellas: 5, avatar: '', comentario: '' };
    }
  }

  eliminarTestimonio(index: number): void {
    this.contenido.testimonios.splice(index, 1);
  }

  agregarFaq(): void {
    if (!this.contenido.faqs) this.contenido.faqs = [];
    if (this.nuevoFaq.pregunta && this.nuevoFaq.respuesta) {
      this.contenido.faqs.push({ ...this.nuevoFaq });
      this.nuevoFaq = { pregunta: '', respuesta: '' };
    }
  }

  eliminarFaq(index: number): void {
    this.contenido.faqs.splice(index, 1);
  }

  agregarImagenGaleria(): void {
    if (!this.contenido.imagenes) this.contenido.imagenes = [];
    if (this.nuevaGaleriaImg.imageUrl) {
      this.contenido.imagenes.push({ ...this.nuevaGaleriaImg });
      this.nuevaGaleriaImg = { imageUrl: '', caption: '' };
    }
  }

  eliminarImagenGaleria(index: number): void {
    this.contenido.imagenes.splice(index, 1);
  }

  guardarComponente(): void {
    const payload: ComponenteDinamico = {
      tipo: this.tipoSeleccionado,
      activo: this.activoSeleccionado ? 1 : 0,
      contenido: this.contenido
    };

    if (this.editingComponente && this.editingComponente.id) {
      this.componentesService.actualizarComponente(this.editingComponente.id, payload).subscribe({
        next: () => {
          this.cargarComponentes();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else {
      this.componentesService.crearComponente(payload).subscribe({
        next: () => {
          this.cargarComponentes();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }
}

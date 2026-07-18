import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService, ClienteUsuario } from '../../../../services/usuarios.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.css'
})
export class AdminUsuariosComponent implements OnInit {
  clientes: ClienteUsuario[] = [];
  filtrados: ClienteUsuario[] = [];
  cargando = true;
  error = '';
  busqueda = '';

  // Paginación
  pagina = 1;
  porPagina = 10;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.usuariosService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.filtrados = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los usuarios.';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  filtrar(): void {
    const q = this.busqueda.toLowerCase().trim();
    this.filtrados = q
      ? this.clientes.filter(c =>
          c.nombre?.toLowerCase().includes(q) ||
          c.apellidos?.toLowerCase().includes(q) ||
          c.correo?.toLowerCase().includes(q) ||
          c.ciudad?.toLowerCase().includes(q)
        )
      : [...this.clientes];
    this.pagina = 1;
  }

  get paginados(): ClienteUsuario[] {
    const inicio = (this.pagina - 1) * this.porPagina;
    return this.filtrados.slice(inicio, inicio + this.porPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.filtrados.length / this.porPagina);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  // Estado del Modal de Confirmación
  showConfirmModal = false;
  modalConfig: { titulo: string; mensaje: string; tipo: 'eliminar' | 'estado'; cliente: ClienteUsuario | null } = {
    titulo: '',
    mensaje: '',
    tipo: 'eliminar',
    cliente: null
  };

  // Estado del Toast (Gadget de éxito/error)
  toast = {
    show: false,
    mensaje: '',
    tipo: 'success' as 'success' | 'error'
  };
  toastTimeout: any;

  mostrarToast(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.toast = { show: true, mensaje, tipo };
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toast.show = false;
    }, 3000);
  }

  inicial(nombre: string | null): string {
    return nombre?.charAt(0).toUpperCase() ?? '?';
  }

  alternarEstado(cliente: ClienteUsuario): void {
    const nuevoEstado = !cliente.activo;
    const accion = nuevoEstado ? 'Activar' : 'Desactivar';
    
    this.modalConfig = {
      titulo: `${accion} Usuario`,
      mensaje: `¿Estás seguro de que deseas ${accion.toLowerCase()} a ${cliente.nombre}?`,
      tipo: 'estado',
      cliente: cliente
    };
    this.showConfirmModal = true;
  }

  eliminarUsuario(cliente: ClienteUsuario): void {
    this.modalConfig = {
      titulo: 'Eliminar Usuario',
      mensaje: `¿Estás seguro de que deseas ELIMINAR a ${cliente.nombre}? Esta acción no se puede deshacer.`,
      tipo: 'eliminar',
      cliente: cliente
    };
    this.showConfirmModal = true;
  }

  confirmarAccionModal(): void {
    if (!this.modalConfig.cliente) return;
    const cliente = this.modalConfig.cliente;

    if (this.modalConfig.tipo === 'estado') {
      const nuevoEstado = !cliente.activo;
      this.usuariosService.cambiarEstadoUsuario(cliente.id, nuevoEstado).subscribe({
        next: (res) => {
          cliente.activo = nuevoEstado;
          this.showConfirmModal = false;
          this.mostrarToast(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} con éxito.`, 'success');
        },
        error: (err) => {
          this.showConfirmModal = false;
          this.mostrarToast('Error al cambiar el estado del usuario.', 'error');
          console.error(err);
        }
      });
    } else if (this.modalConfig.tipo === 'eliminar') {
      this.usuariosService.eliminarUsuario(cliente.id).subscribe({
        next: (res) => {
          this.clientes = this.clientes.filter(c => c.id !== cliente.id);
          this.filtrar();
          this.showConfirmModal = false;
          this.mostrarToast('Usuario eliminado correctamente.', 'success');
        },
        error: (err) => {
          this.showConfirmModal = false;
          this.mostrarToast('Error al eliminar el usuario.', 'error');
          console.error(err);
        }
      });
    }
  }

  cerrarModal(): void {
    this.showConfirmModal = false;
    this.modalConfig.cliente = null;
  }
}

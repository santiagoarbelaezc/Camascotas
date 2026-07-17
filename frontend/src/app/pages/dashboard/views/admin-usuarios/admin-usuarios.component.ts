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

  inicial(nombre: string | null): string {
    return nombre?.charAt(0).toUpperCase() ?? '?';
  }

  alternarEstado(cliente: ClienteUsuario): void {
    const nuevoEstado = !cliente.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    if (confirm(`¿Estás seguro de que deseas ${accion} a ${cliente.nombre}?`)) {
      this.usuariosService.cambiarEstadoUsuario(cliente.id, nuevoEstado).subscribe({
        next: (res) => {
          cliente.activo = nuevoEstado;
        },
        error: (err) => {
          alert('Error al cambiar el estado del usuario.');
          console.error(err);
        }
      });
    }
  }

  eliminarUsuario(cliente: ClienteUsuario): void {
    if (confirm(`¿Estás seguro de que deseas ELIMINAR a ${cliente.nombre}? Esta acción no se puede deshacer.`)) {
      this.usuariosService.eliminarUsuario(cliente.id).subscribe({
        next: (res) => {
          this.clientes = this.clientes.filter(c => c.id !== cliente.id);
          this.filtrar();
        },
        error: (err) => {
          alert('Error al eliminar el usuario.');
          console.error(err);
        }
      });
    }
  }
}

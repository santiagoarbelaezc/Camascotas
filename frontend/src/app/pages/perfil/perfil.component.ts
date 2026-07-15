import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UsuariosService, PerfilUsuario } from '../../services/usuarios.service';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  readonly personalizacionActiva = environment.personalizacionActiva;
  
  vistaActual: 'menu' | 'datos' = 'menu';
  cargando = true;
  guardando = false;
  
  perfil: PerfilUsuario | null = null;
  formData: Partial<PerfilUsuario> & { password?: string } = {
    nombre: '',
    apellidos: '',
    correo: '',
    ciudad: '',
    direccion: '',
    edad: null,
    password: ''
  };

  constructor(
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private usuariosService: UsuariosService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.cargando = false;
      return;
    }

    // Comprobar si viene de navegación rápida (ej: ?tab=datos)
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'datos') {
        this.vistaActual = 'datos';
      }
    });

    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.usuariosService.getMiPerfil().subscribe({
      next: (data) => {
        this.perfil = data;
        this.formData = {
          nombre: data.nombre || '',
          apellidos: data.apellidos || '',
          correo: data.correo || '',
          ciudad: data.ciudad || '',
          direccion: data.direccion || '',
          edad: data.edad || null,
          password: ''
        };
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar perfil', err);
        // Fallback a los datos en sesión si el endpoint falla
        const userSesion = this.auth.getUsuario();
        if (userSesion) {
          this.formData.nombre = userSesion.nombre || '';
          this.formData.correo = userSesion.correo || '';
        }
        this.cargando = false;
      }
    });
  }

  seleccionarVista(vista: 'menu' | 'datos'): void {
    this.vistaActual = vista;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  guardarDatos(): void {
    if (!this.formData.nombre?.trim()) {
      this.toast.show('El nombre no puede estar vacío', 'error');
      return;
    }

    this.guardando = true;
    const datosEnvio: any = {
      nombre: this.formData.nombre.trim(),
      apellidos: (this.formData.apellidos || '').trim(),
      ciudad: (this.formData.ciudad || '').trim(),
      direccion: (this.formData.direccion || '').trim(),
      edad: this.formData.edad || null
    };

    if (this.formData.password?.trim()) {
      datosEnvio.password = this.formData.password.trim();
    }

    this.usuariosService.actualizarMiPerfil(datosEnvio).subscribe({
      next: (res) => {
        this.guardando = false;
        if (res && res.usuario) {
          this.perfil = res.usuario;
          // Actualizar sesión para que el navbar cambie inmediatamente
          const sesionActual = this.auth.getUsuario() || { id: 0, nombre: '', correo: '', rol: '' };
          sesionActual.nombre = res.usuario.nombre;
          this.auth.actualizarUsuarioSesion(sesionActual);
        }
        this.toast.show('¡Tus datos personales han sido actualizados con éxito!', 'success');
        this.formData.password = ''; // Limpiar campo contraseña
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al actualizar datos', err);
        this.toast.show('Ocurrió un error al guardar los cambios. Intenta nuevamente.', 'error');
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

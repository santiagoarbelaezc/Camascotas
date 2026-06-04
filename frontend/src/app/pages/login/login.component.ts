import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  modo: 'login' | 'registro' = 'login';

  // Campos comunes/Login
  correo   = '';
  password = '';

  // Campos de registro
  nombre    = '';
  apellidos = '';
  edad: number | null = null;
  direccion = '';
  ciudad    = '';

  cargando = false;
  error    = '';
  showPassword = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private loadingService: LoadingService,
    private ngZone: NgZone
  ) {
    this.loadingService.show(800);
  }

  ngOnInit(): void {
    this.cargarGoogleSDK();
  }

  cambiarModo(nuevoModo: 'login' | 'registro'): void {
    this.modo = nuevoModo;
    this.error = '';
    
    // Si cambiamos de modo, reiniciamos el botón de Google para asegurarnos de que se dibuje correctamente
    if (this.modo === 'login') {
      setTimeout(() => this.inicializarGoogle(), 100);
    }
  }

  login(): void {
    if (!this.correo || !this.password) {
      this.error = 'Ingresa tu correo y contraseña';
      return;
    }

    this.cargando = true;
    this.error    = '';

    this.auth.login({ correo: this.correo, password: this.password }).subscribe({
      next: (res) => {
        this.auth.guardarSesion(res);
        this.redirigirUsuario(res.usuario.rol);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.error ?? 'Credenciales incorrectas';
      }
    });
  }

  registrar(): void {
    if (!this.nombre || !this.apellidos || !this.edad || !this.direccion || !this.ciudad || !this.correo || !this.password) {
      this.error = 'Completa todos los campos obligatorios';
      return;
    }

    this.cargando = true;
    this.error    = '';

    const datos = {
      nombre: this.nombre,
      apellidos: this.apellidos,
      edad: this.edad,
      direccion: this.direccion,
      ciudad: this.ciudad,
      correo: this.correo,
      password: this.password,
      rol: 'cliente'
    };

    this.auth.registroCliente(datos).subscribe({
      next: (res) => {
        this.auth.guardarSesion(res);
        this.redirigirUsuario('cliente');
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.error ?? 'Error al registrarse';
      }
    });
  }

  private cargarGoogleSDK(): void {
    if (document.getElementById('google-jssdk')) {
      this.inicializarGoogle();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-jssdk';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.inicializarGoogle();
    document.head.appendChild(script);
  }

  private inicializarGoogle(): void {
    // Camascotas Google Client ID
    const clientId = '730825316498-um9r1rskqpt351d3b3eeccdc44bbdd.apps.googleusercontent.com';

    if ((window as any).google?.accounts?.id) {
      const idObj = (window as any).google.accounts.id;
      idObj.initialize({
        client_id: clientId,
        callback: (res: any) => this.handleGoogleCredentialResponse(res)
      });
      
      const btnDiv = document.getElementById('googleBtn');
      if (btnDiv) {
        idObj.renderButton(btnDiv, {
          theme: 'outline',
          size: 'large',
          width: 350,
          text: 'continue_with',
          shape: 'pill'
        });
      }
    }
  }

  private handleGoogleCredentialResponse(response: any): void {
    this.cargando = true;
    this.error = '';

    // Google Callback se ejecuta fuera de la zona de detección de Angular, usamos ngZone
    this.ngZone.run(() => {
      this.auth.loginConGoogle(response.credential).subscribe({
        next: (res) => {
          this.auth.guardarSesion(res);
          this.redirigirUsuario(res.usuario.rol);
        },
        error: (err) => {
          this.cargando = false;
          this.error = err?.error?.error ?? 'Error en autenticación de Google';
        }
      });
    });
  }

  private redirigirUsuario(rol: string): void {
    if (rol === 'admin' || rol === 'superadmin') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  backToHome(): void {
    this.router.navigate(['/home']);
  }
}


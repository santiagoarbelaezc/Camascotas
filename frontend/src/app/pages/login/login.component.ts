import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  modo: 'login' | 'registro' | 'verificacion' = 'login';

  // Campos comunes/Login
  correo   = '';
  password = '';

  // Campos de registro
  nombre    = '';
  apellidos = '';
  edad: number | null = null;
  direccion = '';
  ciudad    = '';

  // Campos de verificación
  correoVerificacion = '';
  codigoVerificacion = '';
  cargandoVerificacion = false;
  errorVerificacion = '';
  mensajeVerificacion = '';
  tiempoReenvio = 0;
  intervaloReenvio: any = null;

  cargando = false;
  error    = '';
  showPassword = false;
  aceptaTerminos = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private loadingService: LoadingService,
    private ngZone: NgZone
  ) {
    this.loadingService.show(800);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'registro') {
        this.modo = 'registro';
      } else if (params['mode'] === 'verificacion') {
        this.modo = 'verificacion';
      } else {
        this.modo = 'login';
      }
    });
    this.cargarGoogleSDK();
  }

  cambiarModo(nuevoModo: 'login' | 'registro' | 'verificacion'): void {
    this.modo = nuevoModo;
    this.error = '';
    this.errorVerificacion = '';
    
    // Si cambiamos de modo a login, reiniciamos el botón de Google para asegurarnos de que se dibuje correctamente
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
         this.redirigirUsuario(res.usuario?.rol ?? 'cliente');
      },
      error: (err) => {
        this.cargando = false;
        const resp = err?.error;
        if (resp?.requiere_verificacion) {
          this.correoVerificacion = resp.correo ?? this.correo;
          this.errorVerificacion = resp.error ?? 'Ingresa el código enviado a tu correo.';
          this.cambiarModo('verificacion');
        } else {
          this.error = resp?.error ?? 'Credenciales incorrectas';
        }
      }
    });
  }

  registrar(): void {
    if (!this.nombre || !this.apellidos || !this.edad || !this.direccion || !this.ciudad || !this.correo || !this.password) {
      this.error = 'Completa todos los campos obligatorios';
      return;
    }

    if (!this.aceptaTerminos) {
      this.error = 'Debe aceptar los términos y condiciones para continuar';
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
        this.cargando = false;
        if (res.requiere_verificacion) {
          this.correoVerificacion = res.correo ?? this.correo;
          this.mensajeVerificacion = res.mensaje ?? 'Hemos enviado un código de 6 dígitos a tu correo.';
          this.cambiarModo('verificacion');
          this.iniciarTemporizadorReenvio();
        } else {
          if (res.token && res.usuario) {
            this.auth.guardarSesion(res);
            this.redirigirUsuario('cliente');
          }
        }
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.error ?? 'Error al registrarse';
      }
    });
  }

  verificarMiCodigo(): void {
    if (!this.codigoVerificacion || this.codigoVerificacion.length !== 6) {
      this.errorVerificacion = 'Ingresa los 6 dígitos numéricos del código';
      return;
    }
    this.cargandoVerificacion = true;
    this.errorVerificacion = '';
    this.mensajeVerificacion = '';

    this.auth.verificarCodigo(this.correoVerificacion, this.codigoVerificacion).subscribe({
      next: (res) => {
        this.cargandoVerificacion = false;
        if (res.token && res.usuario) {
          this.auth.guardarSesion(res);
          this.redirigirUsuario(res.usuario.rol);
        } else {
          this.mensajeVerificacion = res.mensaje;
          setTimeout(() => this.cambiarModo('login'), 2000);
        }
      },
      error: (err) => {
        this.cargandoVerificacion = false;
        this.errorVerificacion = err?.error?.error ?? 'Código de verificación incorrecto o expirado';
      }
    });
  }

  get tiempoReenvioFormateado(): string {
    const min = Math.floor(this.tiempoReenvio / 60);
    const sec = this.tiempoReenvio % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  reenviarMiCodigo(): void {
    if (this.tiempoReenvio > 0) return;
    if (!this.correoVerificacion) {
      this.errorVerificacion = 'Ingresa el correo para reenviar el código';
      return;
    }
    this.errorVerificacion = '';
    this.mensajeVerificacion = 'Reenviando código a tu correo...';

    this.auth.reenviarCodigo(this.correoVerificacion).subscribe({
      next: (res) => {
        this.mensajeVerificacion = res.mensaje ?? 'Se ha enviado un nuevo código de 6 dígitos a tu correo.';
        this.iniciarTemporizadorReenvio();
      },
      error: (err) => {
        this.errorVerificacion = err?.error?.error ?? 'Error al reenviar el código';
        this.mensajeVerificacion = '';
      }
    });
  }

  iniciarTemporizadorReenvio(): void {
    this.tiempoReenvio = 900; // 15 minutos
    if (this.intervaloReenvio) clearInterval(this.intervaloReenvio);
    this.intervaloReenvio = setInterval(() => {
      if (this.tiempoReenvio > 0) {
        this.tiempoReenvio--;
      } else {
        clearInterval(this.intervaloReenvio);
      }
    }, 1000);
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

    this.ngZone.run(() => {
      this.auth.loginConGoogle(response.credential).subscribe({
        next: (res) => {
          if (res.token && res.usuario) {
            this.auth.guardarSesion(res);
            this.redirigirUsuario(res.usuario.rol);
          }
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


import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';

interface CarouselSlide {
  imagen: string;
  badge: string;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  modo: 'login' | 'registro' | 'verificacion' | 'recuperacion' = 'login';

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

  // Campos de recuperación de contraseña
  correoRecuperacion = '';
  cargandoRecuperacion = false;
  mensajeRecuperacion = '';
  errorRecuperacion = '';

  // Modal Alerta Recuperación
  mostrarModalRecuperacion = false;
  mensajeModalRecuperacion = '';

  // Modal Éxito Inicio de Sesión
  mostrarModalExito = false;
  badgeModalExito = '';
  tituloModalExito = '';
  mensajeModalExito = '';
  rolTemporalLogin = 'cliente';
  esAdminLogin = false;

  // Modal Sesión Cerrada Correctamente
  mostrarModalLogout = false;

  cargando = false;
  error    = '';
  showPassword = false;
  showConfirmPassword = false;
  confirmarPassword = '';
  aceptaTerminos = false;

  // Validación de Existencia de Correo en Tiempo Real
  verificandoCorreo = false;
  estadoCorreo: { valido: boolean; registrado: boolean; mensaje: string } | null = null;
  private debounceTimeout: any = null;

  onCorreoChange(): void {
    if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
    
    if (!this.correo || !this.correo.includes('@')) {
      this.estadoCorreo = null;
      return;
    }

    this.debounceTimeout = setTimeout(() => {
      this.verificandoCorreo = true;
      this.auth.validarCorreo(this.correo).subscribe({
        next: (res) => {
          this.verificandoCorreo = false;
          this.estadoCorreo = res;
        },
        error: () => {
          this.verificandoCorreo = false;
        }
      });
    }, 450);
  }

  // Getters para validación de contraseña segura
  get passwordTieneLongitud(): boolean { return this.password.length >= 7; }
  get passwordTieneMayuscula(): boolean { return /[A-Z]/.test(this.password); }
  get passwordTieneNumero(): boolean { return /[0-9]/.test(this.password); }
  get passwordEsSegura(): boolean { return this.passwordTieneLongitud && this.passwordTieneMayuscula && this.passwordTieneNumero; }

  get passwordFortaleza(): number {
    if (!this.password) return 0;
    let score = 0;
    if (this.passwordTieneLongitud) score += 34;
    if (this.passwordTieneMayuscula) score += 33;
    if (this.passwordTieneNumero) score += 33;
    return score;
  }

  get passwordEtiquetaFortaleza(): string {
    const score = this.passwordFortaleza;
    if (score === 0) return '';
    if (score <= 34) return 'Débil';
    if (score <= 67) return 'Media';
    return 'Excelente / Segura';
  }

  get passwordCoincide(): boolean {
    if (!this.password && !this.confirmarPassword) return true;
    return !!this.confirmarPassword && this.password === this.confirmarPassword;
  }

  // Carrusel Izquierdo Exclusivo
  activeSlideIndex = 0;
  slideInterval: any = null;

  carouselSlides: CarouselSlide[] = [
    {
      imagen: 'assets/images/bannerperrocopy.png',
      badge: 'COMUNIDAD CAMASCOTAS',
      titulo: 'Comunidad Camascotas',
      descripcion: '"Regístrate para que obtengas los mejores descuentos exclusivos"'
    },
    {
      imagen: 'assets/images/home1.jpeg',
      badge: 'NOVEDADES & LANZAMIENTOS',
      titulo: 'Novedades de Catálogo',
      descripcion: '"Ingresa con nosotros para estar atento a todas las novedades de nuestros productos"'
    },
    {
      imagen: 'assets/images/home4.jpeg',
      badge: 'BENEFICIOS EXCLUSIVOS',
      titulo: 'Experiencia Camascotas',
      descripcion: '"Regístrate para que obtengas los mejores descuentos exclusivos en mobiliario premium"'
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private loadingService: LoadingService,
    private toast: ToastService,
    private ngZone: NgZone
  ) {
    this.loadingService.show(600);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['logout'] === 'success') {
        this.mostrarModalLogout = true;
        this.toast.show('¡Has cerrado sesión correctamente!', 'info', 5000);
      }

      if (params['mode'] === 'registro') {
        this.modo = 'registro';
      } else if (params['mode'] === 'verificacion') {
        this.modo = 'verificacion';
        const pendingEmail = this.auth.getPendingVerification();
        if (pendingEmail) {
          this.correoVerificacion = pendingEmail;
        }
      } else {
        this.modo = 'login';
      }
    });

    this.iniciarCarrusel();
    this.cargarGoogleSDK();
  }

  cerrarModalLogout(): void {
    this.mostrarModalLogout = false;
  }

  ngOnDestroy(): void {
    this.detenerCarrusel();
    if (this.intervaloReenvio) clearInterval(this.intervaloReenvio);
  }

  iniciarCarrusel(): void {
    this.detenerCarrusel();
    this.slideInterval = setInterval(() => {
      this.siguienteSlide();
    }, 4500);
  }

  detenerCarrusel(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }

  siguienteSlide(): void {
    this.activeSlideIndex = (this.activeSlideIndex + 1) % this.carouselSlides.length;
  }

  anteriorSlide(): void {
    this.activeSlideIndex = (this.activeSlideIndex - 1 + this.carouselSlides.length) % this.carouselSlides.length;
  }

  irASlide(index: number): void {
    this.activeSlideIndex = index;
    this.iniciarCarrusel(); // Reset timer on user interaction
  }

  cambiarModo(nuevoModo: 'login' | 'registro' | 'verificacion' | 'recuperacion'): void {
    this.modo = nuevoModo;
    this.error = '';
    this.errorVerificacion = '';
    this.errorRecuperacion = '';
    this.mensajeRecuperacion = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (this.modo === 'login') {
      setTimeout(() => this.inicializarGoogle(), 100);
    }
  }

  solicitarRecuperacionPassword(): void {
    if (!this.correoRecuperacion) {
      this.errorRecuperacion = 'Ingresa tu correo electrónico registrado';
      return;
    }
    this.cargandoRecuperacion = true;
    this.errorRecuperacion = '';
    this.mensajeRecuperacion = '';

    this.auth.solicitarRecuperacion(this.correoRecuperacion).subscribe({
      next: (res) => {
        this.cargandoRecuperacion = false;
        this.mensajeModalRecuperacion = res.mensaje ?? 'Si el correo electrónico se encuentra registrado en nuestro sistema, hemos enviado un código de 6 dígitos que puedes utilizar como contraseña provisional.';
        this.mostrarModalRecuperacion = true;
        this.cambiarModo('login');
      },
      error: (err) => {
        this.cargandoRecuperacion = false;
        this.errorRecuperacion = err?.error?.error ?? 'Error al solicitar la recuperación de contraseña';
      }
    });
  }

  cerrarModalRecuperacion(): void {
    this.mostrarModalRecuperacion = false;
  }

  mostrarModalLoginExito(usuario: any): void {
    const rol = usuario?.rol ?? 'cliente';
    const nombre = usuario?.nombre || 'Usuario';
    const esAdmin = (rol === 'admin' || rol === 'superadmin');

    this.rolTemporalLogin = rol;
    this.esAdminLogin = esAdmin;

    if (esAdmin) {
      this.badgeModalExito = 'PANEL ADMINISTRATIVO';
      this.tituloModalExito = `¡Bienvenido al Panel Admin, ${nombre}!`;
      this.mensajeModalExito = 'Acceso concedido con perfil de Administrador. Preparando el dashboard de gestión...';
    } else {
      this.badgeModalExito = 'ACCESO CONCEDIDO';
      this.tituloModalExito = `¡Bienvenido de nuevo, ${nombre}!`;
      this.mensajeModalExito = 'Has iniciado sesión correctamente. Disfruta de la experiencia Camascotas.';
    }

    this.mostrarModalExito = true;

    setTimeout(() => {
      if (this.mostrarModalExito) {
        this.continuarDespuesDeExito();
      }
    }, 1800);
  }

  continuarDespuesDeExito(): void {
    this.mostrarModalExito = false;
    const nombre = this.auth.getUsuario()?.nombre || 'Usuario';
    this.toast.show(`¡Bienvenido de nuevo, ${nombre}!`, 'success', 4000);
    this.redirigirUsuario(this.rolTemporalLogin);
  }

  login(): void {
    if (!this.correo || !this.password) {
      this.error = 'Por favor ingresa tu correo y contraseña para continuar';
      this.toast.show('Completa los datos de inicio de sesión', 'warning');
      return;
    }

    this.cargando = true;
    this.error    = '';

    this.auth.login({ correo: this.correo, password: this.password }).subscribe({
      next: (res) => {
        this.cargando = false;
        this.auth.guardarSesion(res);
        this.mostrarModalLoginExito(res.usuario);
      },
      error: (err) => {
        this.cargando = false;
        const resp = err?.error;
        if (resp?.requiere_verificacion) {
          this.correoVerificacion = resp.correo ?? this.correo;
          this.auth.setPendingVerification(this.correoVerificacion);
          this.errorVerificacion = resp.error ?? 'Ingresa el código enviado a tu correo.';
          this.cambiarModo('verificacion');
          this.toast.show('Tu cuenta requiere verificación por código', 'warning');
        } else {
          this.error = resp?.error ?? 'Correo o contraseña incorrectos. Verifica tus credenciales.';
          this.toast.show('Credenciales incorrectas. Revisa tu contraseña o solicita un código provisional.', 'error');
        }
      }
    });
  }

  registrar(): void {
    if (!this.nombre || !this.apellidos || !this.edad || !this.direccion || !this.ciudad || !this.correo || !this.password || !this.confirmarPassword) {
      this.error = 'Completa todos los campos obligatorios';
      return;
    }

    if (this.estadoCorreo && !this.estadoCorreo.valido) {
      this.error = this.estadoCorreo.mensaje;
      this.toast.show(this.estadoCorreo.mensaje, 'error');
      return;
    }

    if (this.estadoCorreo && this.estadoCorreo.registrado) {
      this.error = 'Este correo electrónico ya se encuentra registrado';
      this.toast.show('El correo ya pertenece a una cuenta registrada', 'warning');
      return;
    }

    if (!this.passwordEsSegura) {
      this.error = 'La contraseña debe tener al menos 7 caracteres, 1 mayúscula y 1 número';
      return;
    }

    if (!this.passwordCoincide) {
      this.error = 'Las contraseñas no coinciden. Por favor verifícalas.';
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
          this.auth.setPendingVerification(this.correoVerificacion);
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
          this.auth.clearPendingVerification();
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
            this.mostrarModalLoginExito(res.usuario);
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

import { Component } from '@angular/core';
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
export class LoginComponent {
  correo   = '';
  password = '';
  cargando = false;
  error    = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private loadingService: LoadingService
  ) {
    this.loadingService.show(800);
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
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.error ?? 'Credenciales incorrectas';
      }
    });
  }

  backToHome(): void {
    this.router.navigate(['/home']);
  }
}


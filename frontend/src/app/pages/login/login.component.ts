import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(
    private router: Router,
    private loadingService: LoadingService
  ) {
    // Activar carga manual al entrar
    this.loadingService.show(800);
  }

  login() {
    this.router.navigate(['/dashboard']);
  }

  backToHome() {
    this.router.navigate(['/home']);
  }
}

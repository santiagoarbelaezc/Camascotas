import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderIndexComponent } from './components/header-index/header-index.component';
import { FooterComponent } from './components/footer/footer.component';
import { WhatsappComponent } from './components/whatsapp/whatsapp.component';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { LoadingComponent } from './components/loading/loading.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { LoadingService } from './services/loading.service';
import { StatsService } from './services/stats.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    NavbarComponent, 
    FooterComponent, 
    WhatsappComponent,
    SplashScreenComponent,
    BottomNavComponent,
    LoadingComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Camascotas';
  isAssistantMode = false;
  isLoginPage = false;
  isAdminPage = false;
  isPageLoading = false;

  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private statsService: StatsService
  ) {
    // Suscribirse al estado de carga manual
    this.loadingService.loading$.subscribe(state => {
      this.isPageLoading = state;
    });

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;
        this.isAssistantMode = currentUrl.includes('/asistente');
        this.isLoginPage     = currentUrl.includes('/login');
        this.isAdminPage     = currentUrl.includes('/dashboard');
        
        // Registrar visita si NO es una página administrativa
        if (!this.isAdminPage && !this.isLoginPage) {
          this.statsService.registrarVisita(currentUrl, document.referrer).subscribe();
        }

        // Aplicar clase al body
        if (this.isAssistantMode) {
          document.body.classList.add('theme-dark');
        } else {
          document.body.classList.remove('theme-dark');
        }

        // Siempre resetear scroll al final de la navegación
        window.scrollTo(0, 0);
      }
    });
  }
}



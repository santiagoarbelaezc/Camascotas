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
  isPageLoading = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        this.isPageLoading = true;
      }

      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;
        this.isAssistantMode = currentUrl.includes('/asistente');
        this.isLoginPage = currentUrl.includes('/login');
        
        // Aplicar clase al body
        if (this.isAssistantMode) {
          document.body.classList.add('theme-dark');
        } else {
          document.body.classList.remove('theme-dark');
        }

        // Delay artificial de 1.5s para la elegancia solicitada
        setTimeout(() => {
          this.isPageLoading = false;
          window.scrollTo(0, 0); // Reset scroll on navigation end
        }, 1500);
      }
    });
  }
}



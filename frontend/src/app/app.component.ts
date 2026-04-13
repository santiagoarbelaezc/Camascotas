import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderIndexComponent } from './components/header-index/header-index.component';
import { FooterComponent } from './components/footer/footer.component';
import { WhatsappComponent } from './components/whatsapp/whatsapp.component';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderIndexComponent, FooterComponent, WhatsappComponent, SplashScreenComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Camascotas';
}



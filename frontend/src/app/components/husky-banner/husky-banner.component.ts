import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-husky-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './husky-banner.component.html',
  styleUrl: './husky-banner.component.css'
})
export class HuskyBannerComponent {
  constructor(
    private uiService: UiService,
    private router: Router
  ) {}

  openAssistant(): void {
    if (window.innerWidth < 768) {
      // En móvil redirigimos a la página dedicada del asistente
      this.router.navigate(['/asistente']);
    } else {
      // En desktop abrimos el widget flotante
      this.uiService.openAssistant();
    }
  }
}

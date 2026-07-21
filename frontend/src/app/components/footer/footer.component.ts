import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  constructor(public pwaService: PwaService) {}

  abrirPwaModal(): void {
    this.pwaService.abrirModal();
  }
}

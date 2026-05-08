import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-husky-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './husky-banner.component.html',
  styleUrl: './husky-banner.component.css'
})
export class HuskyBannerComponent {
  constructor(private uiService: UiService) {}

  openAssistant(): void {
    this.uiService.openAssistant();
  }
}

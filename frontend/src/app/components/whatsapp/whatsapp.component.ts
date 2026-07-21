import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenteComponent } from '../../pages/asistente/asistente.component';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-whatsapp',
  standalone: true,
  imports: [CommonModule, FormsModule, AsistenteComponent],
  templateUrl: './whatsapp.component.html',
  styleUrl: './whatsapp.component.css'
})
export class WhatsappComponent implements OnInit, OnDestroy {
  isChatOpen = false;
  isVisible = false;
  private sub = new Subscription();
  private showTimer: any;

  currentVideoSrc = 'assets/videos/video-husky10.mp4';

  @ViewChild('huskyVideo') huskyVideoRef?: ElementRef<HTMLVideoElement>;

  constructor(private uiService: UiService) {}

  ngOnInit(): void {
    this.sub.add(
      this.uiService.assistantOpen$.subscribe(open => {
        this.isChatOpen = open;
      })
    );

    // Mostramos el flotante justo después del splash screen
    this.showTimer = setTimeout(() => {
      this.isVisible = true;
    }, 4100);
  }

  onMouseEnter(): void {
    if (this.huskyVideoRef?.nativeElement) {
      const video = this.huskyVideoRef.nativeElement;
      video.muted = true;
      video.volume = 0;
      video.play().catch(() => {});
    }
  }

  onMouseLeave(): void {
    if (this.huskyVideoRef?.nativeElement) {
      const video = this.huskyVideoRef.nativeElement;
      video.pause();
      video.currentTime = 0;
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    clearTimeout(this.showTimer);
  }

  toggleChat(): void {
    this.uiService.toggleAssistant();
  }

  closeChat(): void {
    this.uiService.closeAssistant();
  }
}

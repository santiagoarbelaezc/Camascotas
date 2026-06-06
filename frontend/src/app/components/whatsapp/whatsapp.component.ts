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
  private sequenceTimer: any;

  currentVideoSrc = 'assets/videos/video-husky10.mp4';
  isFading = false;

  @ViewChild('huskyVideo') huskyVideoRef?: ElementRef<HTMLVideoElement>;

  constructor(private uiService: UiService) {}

  ngOnInit(): void {
    this.sub.add(
      this.uiService.assistantOpen$.subscribe(open => {
        this.isChatOpen = open;
      })
    );

    // El splash dura 4s — mostramos el flotante justo despues
    this.showTimer = setTimeout(() => {
      this.isVisible = true;
      // Reproducir el video inicial tras el pop-in
      setTimeout(() => {
        this.playCurrentVideo();
      }, 500);
    }, 4100);
  }

  playCurrentVideo() {
    if (this.huskyVideoRef?.nativeElement) {
      this.huskyVideoRef.nativeElement.muted = true;
      this.huskyVideoRef.nativeElement.volume = 0;
      this.huskyVideoRef.nativeElement.play().catch(() => {});
    }
  }

  onVideoEnded() {
    // Esperamos 5 segundos antes de repetir el video
    this.sequenceTimer = setTimeout(() => {
      
      // 1. Iniciamos el desvanecimiento (fade out)
      this.isFading = true;

      // 2. Esperamos a que termine el fade out (400ms)
      setTimeout(() => {
        // Reiniciamos el video al inicio mientras está oculto
        if (this.huskyVideoRef?.nativeElement) {
          this.huskyVideoRef.nativeElement.currentTime = 0;
        }
        
        // 3. Pequeño delay
        setTimeout(() => {
          // Iniciamos la reproducción
          this.playCurrentVideo();
          // Revelamos el video suavemente (fade in)
          this.isFading = false;
        }, 150);

      }, 400);

    }, 5000);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    clearTimeout(this.showTimer);
    clearTimeout(this.sequenceTimer);
  }

  toggleChat() {
    this.uiService.toggleAssistant();
  }

  closeChat() {
    this.uiService.closeAssistant();
  }
}

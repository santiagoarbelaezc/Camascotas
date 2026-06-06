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
      // Reproducir el video una sola vez tras el pop-in
      setTimeout(() => {
        if (this.huskyVideoRef?.nativeElement) {
          this.huskyVideoRef.nativeElement.muted = true;
          this.huskyVideoRef.nativeElement.volume = 0;
          this.huskyVideoRef.nativeElement.play().catch(() => {});
        }
      }, 500);
    }, 4100);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    clearTimeout(this.showTimer);
  }

  toggleChat() {
    this.uiService.toggleAssistant();
  }

  closeChat() {
    this.uiService.closeAssistant();
  }
}

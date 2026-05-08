import { Component, OnInit, OnDestroy } from '@angular/core';
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
  private sub = new Subscription();

  constructor(private uiService: UiService) {}

  ngOnInit(): void {
    this.sub.add(
      this.uiService.assistantOpen$.subscribe(open => {
        this.isChatOpen = open;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleChat() {
    this.uiService.toggleAssistant();
  }

  closeChat() {
    this.uiService.closeAssistant();
  }
}

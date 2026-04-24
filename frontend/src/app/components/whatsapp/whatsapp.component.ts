import { Component, ChangeDetectorRef, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, ChatMessage } from '../../services/gemini.service';

@Component({
  selector: 'app-whatsapp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whatsapp.component.html',
  styleUrl: './whatsapp.component.css'
})
export class WhatsappComponent implements AfterViewChecked {
  isChatOpen = false;
  userMessage = '';
  chatHistory: ChatMessage[] = [];
  isLoading = false;

  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  constructor(
    private geminiService: GeminiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen && this.chatHistory.length === 0) {
      this.chatHistory.push({
        text: '¡Hola! Soy Elisa, un gusto saludarte. En Camascotas estamos listos para consentir a tu mejor amigo con muebles premium desde nuestra sede en Armenia, Quindío. ¿Buscas algo especial para tu perro o gato?',
        isBot: true
      });
    }
  }

  closeChat() {
    this.isChatOpen = false;
  }

  async sendMessage() {
    if (!this.userMessage.trim()) return;

    const message = this.userMessage;
    this.userMessage = '';

    this.chatHistory.push({ text: message, isBot: false });
    this.isLoading = true;

    const { text } = await this.geminiService.sendMessage(message);

    this.chatHistory.push({ text, isBot: true });
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}

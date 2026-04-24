import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GeminiService, ChatMessage } from '../../services/gemini.service';

/**
 * Componente de Asistente Virtual Husky
 * Maneja el chat con IA y redirecciones automáticas.
 */
@Component({
  selector: 'app-asistente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistente.component.html',
  styleUrl: './asistente.component.css'
})
export class AsistenteComponent implements OnInit, AfterViewChecked {

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  messages: ChatMessage[] = [];
  inputText = '';
  isLoading = false;
  private shouldScroll = false;

  // Husky mascot state
  currentVideo: string | null = null;
  isPlaying = false;
  idleImage = 'assets/videos/husky.png';
  showMascot = true;

  constructor(
    private geminiService: GeminiService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.messages = await this.geminiService.getHistory();
    if (this.messages.length > 0) {
      this.showMascot = false;
    }
    this.shouldScroll = true;
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  async sendMessage(): Promise<void> {
    const text = this.inputText.trim();
    if (!text || this.isLoading) return;

    this.showMascot = false;
    this.messages.push({ text, isBot: false });
    this.inputText = '';
    this.isLoading = true;
    this.shouldScroll = true;

    const { text: reply, redirect } = await this.geminiService.sendMessage(text);

    this.messages.push({ text: reply, isBot: true });
    this.isLoading = false;
    this.shouldScroll = true;

    if (redirect) {
      setTimeout(() => this.router.navigate([redirect]), 1800);
    }
  }

  async clearChat(): Promise<void> {
    await this.geminiService.clearSession();
    this.messages = [];
    this.showMascot = true;
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }
    } catch { }
  }
}

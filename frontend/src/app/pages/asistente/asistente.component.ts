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

  // Mascot State (Unified)
  currentVideo: string | null = null;
  isPlaying = false;
  isVideoLoading = false;
  idleImage = 'assets/videos/husky.png';
  isMini = false; // Estado único: false = Grande (Bienvenida), true = Pequeño (Chat)

  constructor(
    private geminiService: GeminiService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.messages = await this.geminiService.getHistory();
    if (this.messages.length > 0) {
      this.isMini = true;
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

    // Cuando se empieza a chatear, el Husky ya no está en modo "Welcome" pero sigue visible arriba (pequeño)
    // Cambiaremos la lógica en el HTML para que sea dinámico
    this.messages.push({ text, isBot: false });
    this.inputText = '';
    this.isLoading = true;
    this.isMini = true; // Activar modo mini al chatear
    this.shouldScroll = true;

    const { text: reply, redirect } = await this.geminiService.sendMessage(text);

    this.messages.push({ text: reply, isBot: true });
    this.isLoading = false;
    this.shouldScroll = true;

    if (redirect) {
      setTimeout(() => this.router.navigateByUrl(redirect), 1800);
    }
  }

  playMascotVideo(videoName: string): void {
    this.currentVideo = `assets/videos/${videoName}`;
    this.isVideoLoading = true;
    this.isPlaying = true;
  }

  onVideoReady(): void {
    this.isVideoLoading = false;
  }

  onVideoEnded(): void {
    this.isPlaying = false;
    this.currentVideo = null;
    this.isVideoLoading = false;
  }

  async clearChat(): Promise<void> {
    await this.geminiService.clearSession();
    this.messages = [];
    this.isMini = false;
    this.isPlaying = false;
    this.currentVideo = null;
  }

  /** Alternar tamaño manualmente al tocarlo */
    toggleMascot(): void {
    if (this.messages.length > 0) {
      this.isMini = !this.isMini;
    }
  }

  /** Manejar scroll para expandir a Husky de forma estable */
  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (!element) return;

    const scrollPos = element.scrollTop;
    
    // Solo expandir si estamos en el tope real y NO estamos cargando una respuesta
    if (scrollPos <= 5) {
      this.isMini = false;
    } 
    // Si bajamos un poco y ya hay conversación, minimizamos para dar foco al chat
    else if (scrollPos > 40 && this.messages.length > 0) {
      this.isMini = true;
    }
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

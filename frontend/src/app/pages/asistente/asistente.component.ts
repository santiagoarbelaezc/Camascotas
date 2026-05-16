import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, Input, Output, EventEmitter } from '@angular/core';
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
export class AsistenteComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @Input() isFloating = false;
  @Output() close = new EventEmitter<void>();

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

    // Bloquear scroll del body en móvil para experiencia de "App nativa"
    if (window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy(): void {
    // Restaurar scroll al salir
    document.body.style.overflow = '';
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

    // Forzar que se mantenga mini al menos durante el envío
    // para evitar que onScroll lo revierta si el contenido es corto

    const { text: reply, redirect, products } = await this.geminiService.sendMessage(text);
    
    this.messages.push({ text: reply, isBot: true, products });
    this.isLoading = false;
    this.shouldScroll = true;

    if (redirect) {
      const isExternal = redirect.startsWith('http');
      setTimeout(() => {
        if (isExternal) {
          // En móviles, window.open suele ser bloqueado si ocurre dentro de un timeout.
          // Usamos location.href para asegurar la redirección a WhatsApp/Redes.
          window.location.href = redirect;
        } else {
          this.router.navigateByUrl(redirect);
        }
      }, 1500);
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

  private lastScrollTop = 0;

  /** Manejar scroll para expandir a Husky de forma estable */
  onScroll(): void {
    if (!this.chatContainer) return;

    const element = this.chatContainer.nativeElement;
    const scrollPos = element.scrollTop;
    const scrollDelta = scrollPos - this.lastScrollTop;
    this.lastScrollTop = scrollPos;

    // Si hay carga o estamos procesando, no permitimos expandir
    if (this.isLoading) return;

    // Si el usuario hace scroll hacia ARRIBA de forma significativa o llega al tope
    if (scrollDelta < -10 || scrollPos <= 5) {
      this.isMini = false;
    } 
    // Si el usuario hace scroll hacia ABAJO y ya hay mensajes
    else if (scrollDelta > 10 && scrollPos > 50) {
      this.isMini = true;
    }
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  goToProduct(p: any): void {
    // Redirigir a /compra/muebles-mascotas/slug-pid
    const seoUrl = `/compra/muebles-mascotas/${p.slug}-p${p.id}`;
    this.router.navigateByUrl(seoUrl);
  }

  scrollToTop(): void {
    if (this.chatContainer) {
      this.chatContainer.nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    // Opcional: Expandir a Husky si estaba minimizado
    this.isMini = false;
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

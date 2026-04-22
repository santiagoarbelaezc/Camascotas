import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asistente',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="assistant-ui font-poppins" [class.chat-active]="isChatActive">
      
      <!-- Premium Background Effects (Blobs) - Subtle and deep -->
      <div class="absolute -bottom-20 left-1/4 w-80 h-80 bg-brand-petrol/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="content-wrapper">
        <!-- Mascot Hero Area: Pure Black -->
        <div class="mascot-hero relative z-10 bg-black">
          <!-- Logo for Assistant Area -->
          <img src="assets/icons/logo.png" alt="Camascotas" class="absolute top-12 left-1/2 -translate-x-1/2 h-8 w-auto opacity-80 pointer-events-none">
          
          <div class="mascot-container">
            <!-- Static Base Image -->
            <img [src]="idleImage" alt="Husky" class="mascot-img" [class.faded]="isPlaying">
            
            <!-- Action Video Overlay -->
            <video *ngIf="currentVideo"
                   id="huskyVideo"
                   [src]="currentVideo" 
                   class="mascot-video" 
                   [class.visible]="isPlaying"
                   (ended)="onVideoEnded()"
                   playsinline
                   [muted]="true"
                   volume="0">
            </video>
          </div>
        </div>

        <!-- Action Grid: Floating on black background -->
        <div class="actions-container relative z-10" *ngIf="!isChatActive">
          <div class="px-6">
            <h3 class="section-title">¿Qué quieres que haga Husky?</h3>
            <div class="actions-grid scroll-hide">
              <button *ngFor="let action of actions" 
                      (click)="playAction(action.video)"
                      class="action-btn group"
                      [disabled]="isPlaying">
                <div class="btn-icon-wrapper">
                  <span class="btn-icon transition-transform duration-300 group-hover:scale-125">{{ action.icon }}</span>
                </div>
                <span class="btn-label">{{ action.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input Area: Elegant Tailwind Redesign -->
      <footer class="chat-input-area relative z-20">
        <div class="max-w-xl mx-auto px-4">
          <div class="relative flex items-center">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Escribe un mensaje..." 
              class="block w-full pl-11 pr-12 py-4 bg-gray-900/40 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-turquesa/40 focus:bg-gray-900/60 transition-all sm:text-sm"
              (focus)="isChatActive = true"
              (blur)="isChatActive = false"
            >
            <div class="absolute inset-y-0 right-0 py-1.5 pr-1.5">
              <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-black bg-brand-lima hover:bg-brand-lima/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-lima transition-all">
                Enviar
              </button>
            </div>
          </div>
          
          <div class="flex justify-center mt-4">
            <div class="flex items-center space-x-2">
              <div class="flex space-x-1" *ngIf="!isChatActive">
                <div class="w-1.5 h-1.5 bg-brand-lima rounded-full animate-bounce" style="animation-delay: 0s"></div>
                <div class="w-1.5 h-1.5 bg-brand-lima rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-1.5 h-1.5 bg-brand-lima rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
              </div>
              <span class="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Sincronizado con IA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .assistant-ui {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #000000;
      color: white;
      overflow: hidden;
      position: relative;
    }

    .content-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      padding-bottom: 20px;
    }

    .font-poppins { font-family: 'Poppins', sans-serif; }

    /* Hero Area - Mascot resizing logic */
    .mascot-hero {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
      margin-top: 40px;
    }

    .mascot-container {
      width: 100%;
      max-width: 320px;
      aspect-ratio: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .mascot-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .mascot-img.faded { opacity: 0; transform: scale(0.95); }

    /* Active Chat State: Mascot shrinks and area simplifies */
    .chat-active .mascot-hero {
      transform: translateY(-20px);
    }
    
    .chat-active .mascot-container {
      max-width: 180px;
    }

    .mascot-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      opacity: 0;
      transition: opacity 0.4s ease;
      z-index: 2;
    }

    .mascot-video.visible { opacity: 1; }

    /* Actions Section - Now floating on black below Husky */
    .actions-container {
      margin-top: 10px;
      padding-bottom: 30px;
    }

    .section-title {
      font-size: 0.6rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      color: rgba(255,255,255,0.3);
      margin-bottom: 24px;
      text-align: center;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 14px 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-icon-wrapper { font-size: 1.3rem; }

    .btn-label {
      font-size: 0.5rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.3);
    }

    /* Input Area: Tailwind Elegant redesign */
    .chat-input-area {
      padding: 20px 0 100px; /* Space for BottomNav */
      background: #000000;
      border-top: 1px solid rgba(255,255,255,0.03);
    }

    .scroll-hide::-webkit-scrollbar { display: none; }

    @media (max-height: 750px) {
      .mascot-container { max-width: 260px; }
      .chat-active .mascot-container { max-width: 140px; }
    }
  `]
})
export class AsistenteComponent {
  isChatActive = false;
  currentVideo: string | null = null;
  isPlaying = false;
  idleImage = 'assets/videos/husky.png';

  actions = [
    { label: 'Juguetón', video: 'assets/videos/video-husky2.mp4', icon: '🎾' },
    { label: 'Pansa arriba', video: 'assets/videos/video-husky6.mp4', icon: '🐾' },
    { label: 'Tierno', video: 'assets/videos/video-husky8.mp4', icon: '✨' },
    { label: 'Patita', video: 'assets/videos/video-husky10.mp4', icon: '🐕' },
    { label: 'Música', video: 'assets/videos/video-husky11.mp4', icon: '🎵' },
    { label: 'Cámara', video: 'assets/videos/video-husky12.mp4', icon: '📸' },
    { label: 'Película', video: 'assets/videos/video-husky13.mp4', icon: '🍿' },
    { label: 'Trofeo', video: 'assets/videos/video-husky14.mp4', icon: '🏆' },
  ];

  playAction(videoPath: string) {
    this.currentVideo = videoPath;
    this.isPlaying = true;
    
    setTimeout(() => {
      const videoElement = document.getElementById('huskyVideo') as HTMLVideoElement;
      if (videoElement) {
        videoElement.muted = true;
        videoElement.volume = 0;
        videoElement.play();
      }
    }, 50);
  }

  onVideoEnded() {
    this.isPlaying = false;
    setTimeout(() => {
      this.currentVideo = null;
    }, 500);
  }
}

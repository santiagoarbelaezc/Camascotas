import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay" [class.fade-out]="isFadingOut">
      <div class="glass-orb absolute inset-0 backdrop-blur-3xl bg-brand-petrol/40"></div>
      
      <div class="relative z-10 flex flex-col items-center">
        <!-- Logo Pulsante -->
        <div class="logo-container mb-8">
          <img src="assets/icons/logo.png" alt="Cargando..." class="w-32 h-auto animate-premium-pulse">
        </div>

        <!-- Progress Indicator -->
        <div class="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div class="h-full bg-brand-lima animate-loading-bar shadow-[0_0_15px_#B1D616]"></div>
        </div>
        
        <p class="mt-4 text-white/40 text-[10px] uppercase tracking-[0.4em] font-medium animate-fade-in-out">
          Diseñando confort
        </p>
      </div>

      <!-- Decorative ambient blobs -->
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-brand-turquesa/20 rounded-full blur-[120px] animate-blob"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-lima/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
      transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .fade-out {
      opacity: 0;
      pointer-events: none;
    }

    @keyframes premium-pulse {
      0%, 100% { transform: scale(1); opacity: 0.9; filter: drop-shadow(0 0 0px rgba(177, 214, 22, 0)); }
      50% { transform: scale(1.05); opacity: 1; filter: drop-shadow(0 0 20px rgba(177, 214, 22, 0.3)); }
    }

    .animate-premium-pulse {
      animation: premium-pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }

    @keyframes loading-bar {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(0); }
      100% { transform: translateX(100%); }
    }

    .animate-loading-bar {
      animation: loading-bar 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    }

    @keyframes fade-in-out {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.7; }
    }

    .animate-fade-in-out {
      animation: fade-in-out 3s ease-in-out infinite;
    }

    @keyframes blob {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }

    .animate-blob {
      animation: blob 7s infinite alternate;
    }

    .animation-delay-2000 {
      animation-delay: 2s;
    }
  `]
})
export class LoadingComponent {
  isFadingOut = false;

  fadeOut() {
    this.isFadingOut = true;
  }
}

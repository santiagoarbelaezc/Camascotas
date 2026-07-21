import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private deferredPrompt: any = null;
  private mostrarModalSubject = new BehaviorSubject<boolean>(false);
  mostrarModal$ = this.mostrarModalSubject.asObservable();

  public isIos = false;
  public isAndroid = false;
  public isInstalled = false;

  constructor() {
    this.detectPlatform();
    this.initPwaListeners();
  }

  private detectPlatform(): void {
    if (typeof window === 'undefined') return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    this.isIos = /iphone|ipad|ipod/.test(userAgent);
    this.isAndroid = /android/.test(userAgent);

    // Detectar si ya está instalada o en modo PWA standalone
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
  }

  private initPwaListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.ocultarModal();
    });
  }

  abrirModal(): void {
    this.mostrarModalSubject.next(true);
  }

  ocultarModal(): void {
    this.mostrarModalSubject.next(false);
  }

  puedesInstalarDirecto(): boolean {
    return !!this.deferredPrompt;
  }

  instalarAppDirecto(): Promise<boolean> {
    if (!this.deferredPrompt) return Promise.resolve(false);

    this.deferredPrompt.prompt();
    return this.deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        this.deferredPrompt = null;
        return true;
      }
      return false;
    });
  }
}

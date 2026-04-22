import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  /**
   * Muestra el estado de carga por un tiempo determinado
   * @param duration Tiempo en ms (opcional)
   */
  show(duration?: number) {
    this.loadingSubject.next(true);
    
    if (duration) {
      setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  /**
   * Oculta el estado de carga
   */
  hide() {
    this.loadingSubject.next(false);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private assistantOpenSubject = new BehaviorSubject<boolean>(false);
  assistantOpen$ = this.assistantOpenSubject.asObservable();

  toggleAssistant(state?: boolean): void {
    const newState = state !== undefined ? state : !this.assistantOpenSubject.value;
    this.assistantOpenSubject.next(newState);
  }

  openAssistant(): void {
    this.assistantOpenSubject.next(true);
  }

  closeAssistant(): void {
    this.assistantOpenSubject.next(false);
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  text: string;
  isBot: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private sessionId: string | null = null;

  constructor() {
    this.sessionId = localStorage.getItem('camascotas_chat_session');
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const body: any = { message };

      if (this.sessionId) {
        body.session_id = this.sessionId;
      }

      const response = await fetch(`${environment.apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.error('Error del servidor:', await response.text());
        return 'Lo siento, en este momento no puedo conectarme al servicio. ¿Podrías intentar nuevamente o escribirnos por WhatsApp?';
      }

      const data = await response.json();

      if (data.data?.session_id) {
        this.sessionId = data.data.session_id;
        localStorage.setItem('camascotas_chat_session', this.sessionId!);
      }

      return data.data?.response ?? 'Mmm, no estoy seguro de cómo responder a eso. ¿Hay algo en lo que pueda ayudarte de nuestra tienda?';

    } catch (error) {
      console.error('Error en GeminiService:', error);
      return 'Lo siento, he tenido un problema interno. Escríbenos por WhatsApp para que un asesor te ayude de inmediato.';
    }
  }

  clearSession(): void {
    this.sessionId = null;
    localStorage.removeItem('camascotas_chat_session');
  }
}

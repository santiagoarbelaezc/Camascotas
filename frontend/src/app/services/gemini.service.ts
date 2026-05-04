import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  text: string;
  isBot: boolean;
  products?: any[];
  created_at?: string;
}

export interface ChatApiResponse {
  status: string;
  message: string;
  data: {
    response: string;
    redirect: string | null;
    products?: any[];
    session_id: string;
  };
}

export interface HistoryApiResponse {
  status: string;
  data: {
    history: ChatMessage[];
  };
}

@Injectable({ providedIn: 'root' })
export class GeminiService {

  private sessionId: string;

  constructor() {
    // Recuperar o generar una session_id persistente
    const stored = localStorage.getItem('camascotas_chat_session');
    this.sessionId = stored ?? this.generateSessionId();
    localStorage.setItem('camascotas_chat_session', this.sessionId);
  }

  /** Enviar un mensaje y recibir respuesta */
  async sendMessage(message: string): Promise<{ text: string; redirect: string | null; products?: any[] }> {
    try {
      const res = await fetch(`${environment.apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, session_id: this.sessionId })
      });

      if (!res.ok) {
        console.error('Error del servidor:', await res.text());
        return {
          text: 'Lo siento, en este momento no puedo conectarme al servicio. ¿Podrías intentar nuevamente o escribirnos por WhatsApp?',
          redirect: null
        };
      }

      const data: any = await res.json();

      // Actualizar session_id por si el servidor generó uno nuevo
      if (data.session_id) {
        this.sessionId = data.session_id;
        localStorage.setItem('camascotas_chat_session', this.sessionId);
      }

      return {
        text: data.response ?? '¿Hay algo más en lo que pueda ayudarte?',
        redirect: data.redirect ?? null,
        products: data.products ?? []
      };

    } catch (err) {
      console.error('Error en GeminiService:', err);
      return {
        text: 'Lo siento, tuve un problema interno. Escríbenos por WhatsApp para que un asesor te ayude.',
        redirect: null
      };
    }
  }

  /** Cargar historial de la sesión actual */
  async getHistory(): Promise<ChatMessage[]> {
    try {
      const res = await fetch(
        `${environment.apiUrl}/chat/history?session_id=${this.sessionId}`
      );
      if (!res.ok) return [];

      const data: any = await res.json();
      return data.history ?? [];
    } catch {
      return [];
    }
  }

  /** Limpiar conversación */
  async clearSession(): Promise<void> {
    try {
      await fetch(`${environment.apiUrl}/chat/clear`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: this.sessionId })
      });
    } catch { /* silencioso */ }

    // Generar nueva sesión local
    this.sessionId = this.generateSessionId();
    localStorage.setItem('camascotas_chat_session', this.sessionId);
  }

  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

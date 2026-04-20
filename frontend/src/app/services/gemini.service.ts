import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Producto } from './productos.service';

export interface ChatMessage {
  text: string;
  isBot: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

  constructor() {}

  async sendMessage(message: string, historial: ChatMessage[], productos: Producto[]): Promise<string> {
    const contextPrompt = `Eres 'Elisa', la asistente virtual humana y cercana de 'Camascotas'. 
Nuestra sede principal y fábrica se encuentra en Armenia, Quindío, Colombia (Ubicación: Espumas y Plásticos SAS, Cra. 19 # 35-25 o vía Google Maps).

Personalidad:
- Eres cálida, amable y muy natural. No pareces un robot.
- Usa un tono entusiasta pero profesional.
- Respuestas CORTAS y directas (no más de 2-3 frases cortas por mensaje).
- Si el usuario te saluda, salúdalo con calidez.
- Tu misión es ayudar y recomendar los mejores muebles para perros y gatos.

Contexto de Productos:
${productos.map(p => `- ${p.nombre}: ${p.descripcion} (Precio: $${p.precio})`).join('\n')}

Instrucciones:
- Si el usuario pregunta por la ubicación, menciona que estamos en Armenia, Quindío, en Espumas y Plásticos SAS.
- Sugiere siempre uno de los productos de la lista si encaja en la charla.
- Mantén la conversación fluida y concisa.

Historial:
${historial.slice(-5).map(h => `${h.isBot ? 'Elisa' : 'Usuario'}: ${h.text}`).join('\n')}

Usuario: ${message}
Elisa:`;

    const requestBody = {
      contents: [{
        parts: [{ text: contextPrompt }]
      }]
    };

    try {
        const response = await fetch(`${this.apiUrl}?key=${environment.geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            console.error('Error de API:', await response.text());
            return 'Lo siento, en este momento no puedo conectarme al servicio. ¿Podrías intentar nuevamente o escribirnos por WhatsApp?';
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return 'Mmm, no estoy seguro de cómo responder a eso. ¿Hay algo en lo que pueda ayudarte de nuestra tienda?';
        }

    } catch (error) {
        console.error('Error enviando a Gemini:', error);
        return 'Lo siento, he tenido un problema interno. Escríbenos por WhatsApp para que un asesor te ayude de inmediato.';
    }
  }
}

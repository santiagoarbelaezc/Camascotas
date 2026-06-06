import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface CamaPersonalizada {
  id?: number;
  usuario_id?: number;
  base_color_name: string;
  base_color_value: string;
  cushion_color_name: string;
  cushion_color_value: string;
  pillow_color_name: string;
  pillow_color_value: string;
  show_pillow: boolean;
  font_name: string;
  embroidery_color_name: string;
  pet_name: string;
  created_at?: string;
  usuario_nombre?: string;
  usuario_correo?: string;
}

export interface ColorOption {
  name: string;
  value: string;
  filter: string;
}

export interface FontOption {
  name: string;
  fontFamily: string;
  className: string;
}

export const BED_CONFIG = {
  baseColors: [
    { name: 'Rojo Borgoña', value: '#800020', filter: 'grayscale(1) sepia(1) saturate(2.5) hue-rotate(330deg) brightness(0.6)' },
    { name: 'Azul Marino', value: '#1d2a44', filter: 'grayscale(1) sepia(1) saturate(1.8) hue-rotate(200deg) brightness(0.5)' },
    { name: 'Verde Oliva', value: '#556b2f', filter: 'grayscale(1) sepia(1) saturate(1.5) hue-rotate(70deg) brightness(0.6)' },
    { name: 'Terracota', value: '#b35a38', filter: 'grayscale(1) sepia(1) saturate(2.2) hue-rotate(15deg) brightness(0.7)' },
    { name: 'Rosa Viejo', value: '#d48a94', filter: 'grayscale(1) sepia(1) saturate(1.8) hue-rotate(320deg) brightness(0.9)' },
    { name: 'Azul Acero', value: '#7fa9c7', filter: 'grayscale(1) sepia(1) saturate(1.8) hue-rotate(190deg) brightness(0.95)' },
    { name: 'Verde Salvia', value: '#7fc796', filter: 'grayscale(1) sepia(1) saturate(1.4) hue-rotate(110deg) brightness(0.9)' },
    { name: 'Océano Muted', value: '#6da6ad', filter: 'grayscale(1) sepia(1) saturate(1.6) hue-rotate(160deg) brightness(0.95)' },
    { name: 'Lila Muted', value: '#9b8ab5', filter: 'grayscale(1) sepia(1) saturate(1.5) hue-rotate(245deg) brightness(0.95)' },
    { name: 'Gris Grafito', value: '#475569', filter: 'grayscale(1) brightness(0.6)' },
    { name: 'Negro Carbón', value: '#1e293b', filter: 'grayscale(1) brightness(0.35)' },
    { name: 'Mostaza Muted', value: '#c7b48a', filter: 'grayscale(1) sepia(1) saturate(1.4) hue-rotate(15deg) brightness(0.9)' }
  ] as ColorOption[],
  cushionColors: [
    { name: 'Blanco Crudo', value: '#f3f4f6', filter: 'grayscale(1) brightness(2.1) contrast(0.8)' },
    { name: 'Gris Cemento', value: '#9ca3af', filter: 'grayscale(1) brightness(1.3)' },
    { name: 'Gris Carbón', value: '#374151', filter: 'grayscale(1) brightness(0.7)' },
    { name: 'Beige Arena', value: '#d1c7bd', filter: 'grayscale(1) sepia(1) saturate(1.2) hue-rotate(15deg) brightness(1.8)' },
    { name: 'Rosa Viejo Suave', value: '#e2b5bb', filter: 'grayscale(1) sepia(1) saturate(1.5) hue-rotate(315deg) brightness(1.7)' },
    { name: 'Celeste Muted', value: '#a8c5db', filter: 'grayscale(1) sepia(1) saturate(1.6) hue-rotate(190deg) brightness(1.8)' },
    { name: 'Menta Muted', value: '#adcbba', filter: 'grayscale(1) sepia(1) saturate(1.4) hue-rotate(130deg) brightness(1.8)' },
    { name: 'Marrón Chocolate', value: '#5c4033', filter: 'grayscale(1) sepia(1) saturate(1.5) hue-rotate(10deg) brightness(0.8)' }
  ] as ColorOption[],
  pillowColors: [
    { name: 'Rojo Pasión', value: '#c1121f', filter: 'grayscale(1) sepia(1) saturate(8) hue-rotate(320deg) brightness(0.65) contrast(1.3)' },
    { name: 'Rojo Borgoña', value: '#660708', filter: 'grayscale(1) sepia(1) saturate(6) hue-rotate(315deg) brightness(0.4) contrast(1.3)' },
    { name: 'Rojo Carmín', value: '#9e0a1b', filter: 'grayscale(1) sepia(1) saturate(7.5) hue-rotate(322deg) brightness(0.55) contrast(1.3)' },
    { name: 'Rojo Cereza', value: '#d90429', filter: 'grayscale(1) sepia(1) saturate(8.5) hue-rotate(324deg) brightness(0.75) contrast(1.35)' },
    { name: 'Rojo Terracota', value: '#b85a3a', filter: 'grayscale(1) sepia(1) saturate(6.5) hue-rotate(335deg) brightness(0.65) contrast(1.2)' },
    { name: 'Rojo Fresa', value: '#ff4d6d', filter: 'grayscale(1) sepia(1) saturate(7) hue-rotate(310deg) brightness(0.9) contrast(1.2)' },
    { name: 'Azul Oxford', value: '#03045e', filter: 'grayscale(1) sepia(1) saturate(5) hue-rotate(185deg) brightness(0.4) contrast(1.1)' },
    { name: 'Verde Pino', value: '#132a13', filter: 'grayscale(1) sepia(1) saturate(3.5) hue-rotate(85deg) brightness(0.4) contrast(1.1)' },
    { name: 'Rosa Muted', value: '#d89bb0', filter: 'grayscale(1) sepia(1) saturate(2.5) hue-rotate(295deg) brightness(0.9)' },
    { name: 'Coral Muted', value: '#db9e8a', filter: 'grayscale(1) sepia(1) saturate(2.5) hue-rotate(340deg) brightness(0.9)' },
    { name: 'Ocre Suave', value: '#bfad7c', filter: 'grayscale(1) sepia(1) saturate(2.2) hue-rotate(10deg) brightness(0.9)' },
    { name: 'Salvia Suave', value: '#9bcb9b', filter: 'grayscale(1) sepia(1) saturate(2) hue-rotate(85deg) brightness(0.85)' },
    { name: 'Azul Calma', value: '#89a8cc', filter: 'grayscale(1) sepia(1) saturate(2.5) hue-rotate(175deg) brightness(0.9)' },
    { name: 'Morado Imperial', value: '#4a154b', filter: 'grayscale(1) sepia(1) saturate(4) hue-rotate(245deg) brightness(0.45) contrast(1.2)' }
  ] as ColorOption[],
  fonts: [
    { name: 'Cursiva Elegante', fontFamily: "'Great Vibes', cursive", className: 'font-cursive' },
    { name: 'Moderna Minimalista', fontFamily: "'Montserrat', sans-serif", className: 'font-modern' },
    { name: 'Clásica Serif', fontFamily: "'Playfair Display', serif", className: 'font-classic' },
    { name: 'Divertida Infantil', fontFamily: "'Fredoka One', cursive", className: 'font-playful' }
  ] as FontOption[],
  embroideryColors: [
    { name: 'Dorado Metálico', value: '#d4af37' },
    { name: 'Plateado Brillante', value: '#e2e2e2' },
    { name: 'Blanco Puro', value: '#ffffff' },
    { name: 'Negro Azabache', value: '#1a1a1a' },
    { name: 'Rosa Fucsia', value: '#ff007f' },
    { name: 'Azul Marino', value: '#000080' }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class CamasPersonalizadasService {
  private apiUrl = `${environment.apiUrl}/camas-personalizadas`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  guardarDiseño(diseño: CamaPersonalizada): Observable<{ message: string, id: number }> {
    return this.http.post<{ message: string, id: number }>(this.apiUrl, diseño, { headers: this.auth.getAuthHeaders() });
  }

  actualizarDiseño(id: number, diseño: CamaPersonalizada): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, diseño, { headers: this.auth.getAuthHeaders() });
  }

  getMisCamas(): Observable<CamaPersonalizada[]> {
    return this.http.get<CamaPersonalizada[]>(`${this.apiUrl}/mis-camas`, { headers: this.auth.getAuthHeaders() });
  }

  getTodasCamasAdmin(): Observable<CamaPersonalizada[]> {
    return this.http.get<CamaPersonalizada[]>(`${this.apiUrl}/admin`, { headers: this.auth.getAuthHeaders() });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class CamasPersonalizadasService {
  private apiUrl = `${environment.apiUrl}/camas-personalizadas`;

  constructor(private http: HttpClient) {}

  guardarDiseño(diseño: CamaPersonalizada): Observable<{ message: string, id: number }> {
    return this.http.post<{ message: string, id: number }>(this.apiUrl, diseño);
  }

  getMisCamas(): Observable<CamaPersonalizada[]> {
    return this.http.get<CamaPersonalizada[]>(`${this.apiUrl}/mis-camas`);
  }

  getTodasCamasAdmin(): Observable<CamaPersonalizada[]> {
    return this.http.get<CamaPersonalizada[]>(`${this.apiUrl}/admin`);
  }
}

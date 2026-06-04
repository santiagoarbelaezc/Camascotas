import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ComponenteDinamico {
  id?: number;
  tipo: string;
  orden?: number;
  activo: boolean | number;
  contenido: any;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComponentesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getComponentes(): Observable<ComponenteDinamico[]> {
    return this.http.get<ComponenteDinamico[]>(`${this.apiUrl}/componentes`);
  }

  crearComponente(componente: ComponenteDinamico): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/componentes`, componente, {
      headers: this.auth.getAuthHeaders()
    });
  }

  actualizarComponente(id: number, componente: Partial<ComponenteDinamico>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/componentes/${id}`, componente, {
      headers: this.auth.getAuthHeaders()
    });
  }

  eliminarComponente(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/componentes/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  reordenarComponentes(ids: number[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/componentes/reordenar`, { ids }, {
      headers: this.auth.getAuthHeaders()
    });
  }

  subirImagen(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', file);
    return this.http.post<any>(`${this.apiUrl}/componentes/upload`, formData, {
      headers: this.auth.getAuthHeaders()
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Subcategoria {
  id: number;
  nombre: string;
  cantidad?: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  imagen: string;
  icono_url?: string;
  subcategorias: Subcategoria[];
}

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categoria/con-subcategorias`);
  }

  // CRUD Categorías
  crearCategoria(fd: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/categoria`, fd, {
      headers: this.auth.getAuthHeaders()
    });
  }

  actualizarCategoria(id: number, fd: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/categoria/${id}`, fd, {
      headers: this.auth.getAuthHeaders()
    });
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categoria/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // CRUD Subcategorías
  crearSubcategoria(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/subcategoria`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  actualizarSubcategoria(id: number, data: any): Observable<any> {
    // Para JSON plano, PUT funciona bien en PHP sin spoofing
    return this.http.put(`${this.apiUrl}/subcategoria/${id}`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  eliminarSubcategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subcategoria/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }
}

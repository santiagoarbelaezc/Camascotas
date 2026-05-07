import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface ProductoAdmin {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  desde: number;
  subcategoria_id: number;
  subcategoria?: string;
  categoria?: string;
  imagenes?: string[];
  imagen?: string;
  colores?: string[];
}

@Injectable({ providedIn: 'root' })
export class ProductoAdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getAll(): Observable<ProductoAdmin[]> {
    return this.http.get<ProductoAdmin[]>(`${this.apiUrl}/producto`);
  }

  getById(id: number): Observable<ProductoAdmin> {
    return this.http.get<ProductoAdmin>(`${this.apiUrl}/producto/${id}`);
  }

  crear(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/producto`, formData, {
      headers: this.auth.getAuthHeaders()
    }).pipe(catchError(err => throwError(() => err)));
  }

  actualizar(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/producto/${id}`, formData, {
      headers: this.auth.getAuthHeaders()
    }).pipe(catchError(err => throwError(() => err)));
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/producto/${id}`, {
      headers: this.auth.getAuthHeaders()
    }).pipe(catchError(err => throwError(() => err)));
  }

  /** Get N random products for carousels (public endpoint) */
  getAleatorios(cantidad: number = 8): Observable<ProductoAdmin[]> {
    return this.http.get<ProductoAdmin[]>(`${this.apiUrl}/producto/aleatorios?cantidad=${cantidad}`);
  }

  /** Get the most recent products (already ordered by id DESC by the backend) */
  getRecientes(cantidad: number = 12): Observable<ProductoAdmin[]> {
    return this.http.get<ProductoAdmin[]>(`${this.apiUrl}/producto`).pipe(
      map(productos => productos.slice(0, cantidad))
    );
  }
}

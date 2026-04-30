import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  imagenes?: any[]; // Cambiamos a any[] para soportar strings u objetos con imagen_url
  categoriaId: number;
  subcategoriaId: number;
  desde?: boolean;
  colores?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProductos(categoriaId?: number, subcategoriaId?: number): Observable<Producto[]> {
    let url = `${this.apiUrl}/producto`;
    if (subcategoriaId) {
      url += `?subcategoria_id=${subcategoriaId}`;
    } else if (categoriaId) {
      url += `?categoria_id=${categoriaId}`;
    }
    return this.http.get<Producto[]>(url);
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/producto/${id}`);
  }
}

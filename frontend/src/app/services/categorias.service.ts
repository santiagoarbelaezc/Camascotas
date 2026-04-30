import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

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

const MOCK_CATEGORIAS: Categoria[] = [
  {
    id: 1, nombre: 'Perros', imagen: 'assets/images/15.jpeg',
    subcategorias: [{ id: 1, nombre: 'Cubos' }, { id: 2, nombre: 'Cuadradas' }, { id: 3, nombre: 'Sofás' }]
  },
  {
    id: 2, nombre: 'Gatos', imagen: 'assets/images/other1.jpeg',
    subcategorias: [{ id: 5, nombre: 'Rascadores' }, { id: 6, nombre: 'Cunas' }]
  }
];

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categoria/con-subcategorias`);
  }

  // CRUD Categorías
  crearCategoria(fd: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/categoria`, fd);
  }

  actualizarCategoria(id: number, fd: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/categoria/${id}`, fd); // Usamos POST por el tema de archivos en PHP
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categoria/${id}`);
  }

  // CRUD Subcategorías
  crearSubcategoria(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/subcategoria`, data);
  }

  actualizarSubcategoria(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/subcategoria/${id}`, data);
  }

  eliminarSubcategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subcategoria/${id}`);
  }
}


import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Subcategoria {
  id: number;
  nombre: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  subcategorias: Subcategoria[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private categorias: Categoria[] = [
    {
      id: 1,
      nombre: 'Camitas Perros',
      subcategorias: [
        { id: 1, nombre: 'Cubos' },
        { id: 2, nombre: 'Cuadradas' },
        { id: 3, nombre: 'Sofás' },
        { id: 4, nombre: 'Mini Sofás' }
      ]
    },
    {
      id: 2,
      nombre: 'Camitas Gatos',
      subcategorias: [
        { id: 5, nombre: 'Rascadores' },
        { id: 6, nombre: 'Cunas' }
      ]
    },
    {
      id: 3,
      nombre: 'Accesorios',
      subcategorias: [
        { id: 7, nombre: 'Comederos' },
        { id: 8, nombre: 'Puff' }
      ]
    }
  ];

  getCategorias(): Observable<Categoria[]> {
    return of(this.categorias);
  }
}

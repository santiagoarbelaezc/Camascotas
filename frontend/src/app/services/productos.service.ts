import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoriaId: number;
  subcategoriaId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private productos: Producto[] = [
    { id: 1, nombre: 'Cubo Premium Steel', descripcion: 'Cubo ergonómico para perros pequeños.', precio: 85000, imagen: 'assets/images/11.jpeg', categoriaId: 1, subcategoriaId: 1 },
    { id: 2, nombre: 'Cubo Soft Cream', descripcion: 'Textura suave y acogedora.', precio: 85000, imagen: 'assets/images/12.jpeg', categoriaId: 1, subcategoriaId: 1 },
    { id: 3, nombre: 'Cama Cuadrada XL', descripcion: 'Espacio amplio para razas grandes.', precio: 120000, imagen: 'assets/images/13.jpeg', categoriaId: 1, subcategoriaId: 2 },
    { id: 4, nombre: 'Sofa Canino Elegance', descripcion: 'Diseño tipo sofá para máximo confort.', precio: 150000, imagen: 'assets/images/14.jpeg', categoriaId: 1, subcategoriaId: 3 },
    { id: 5, nombre: 'Mini Sofa Toy', descripcion: 'Ideal para cachorros y perros toy.', precio: 95000, imagen: 'assets/images/15.jpeg', categoriaId: 1, subcategoriaId: 4 },
    { id: 6, nombre: 'Rascador Multilevel', descripcion: 'Diversión y descanso para gatos.', precio: 180000, imagen: 'assets/images/other1.jpeg', categoriaId: 2, subcategoriaId: 5 },
    { id: 7, nombre: 'Cuna Felina Moon', descripcion: 'Diseño lunar para dulces sueños.', precio: 75000, imagen: 'assets/images/other2.jpeg', categoriaId: 2, subcategoriaId: 6 },
    { id: 8, nombre: 'Comedero Ergonómico', descripcion: 'Altura ideal para la digestión.', precio: 45000, imagen: 'assets/images/other3.jpeg', categoriaId: 3, subcategoriaId: 7 },
    { id: 9, nombre: 'Puff Camascotas', descripcion: 'Comodidad extrema para cualquier espacio.', precio: 110000, imagen: 'assets/images/other4.jpeg', categoriaId: 3, subcategoriaId: 8 },
  ];

  getProductos(categoriaId?: number, subcategoriaId?: number): Observable<Producto[]> {
    return of(this.productos).pipe(
      map(prods => {
        if (subcategoriaId) {
          return prods.filter(p => p.subcategoriaId === subcategoriaId);
        }
        if (categoriaId) {
          return prods.filter(p => p.categoriaId === categoriaId);
        }
        return prods;
      })
    );
  }
}

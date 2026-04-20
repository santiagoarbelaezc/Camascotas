import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Producto } from './productos.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoSeleccionadoService {
  private productoSource = new BehaviorSubject<Producto | null>(null);

  setProducto(producto: Producto) {
    this.productoSource.next(producto);
  }

  getProducto(): Observable<Producto | null> {
    return this.productoSource.asObservable();
  }
}

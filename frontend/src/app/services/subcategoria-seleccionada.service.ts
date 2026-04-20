import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubcategoriaSeleccionadaService {
  private subcategoriaIdSource = new BehaviorSubject<number | null>(null);
  subcategoriaId$ = this.subcategoriaIdSource.asObservable();

  setSubcategoriaId(id: number | null) {
    this.subcategoriaIdSource.next(id);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private apiUrl = environment.apiUrl;

  /** BehaviorSubject para que todos los componentes reaccionen en tiempo real */
  private mostrarPreciosSubject = new BehaviorSubject<boolean>(true);
  mostrarPrecios$ = this.mostrarPreciosSubject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {
    this.cargarMostrarPrecios();
  }

  /** Carga el estado inicial desde el backend */
  private cargarMostrarPrecios(): void {
    this.http.get<{ clave: string; valor: string }>(`${this.apiUrl}/configuracion/mostrar_precios`)
      .subscribe({
        next: res => this.mostrarPreciosSubject.next(res.valor === '1'),
        error: () => this.mostrarPreciosSubject.next(true) // fallback: mostrar por defecto
      });
  }

  /** Devuelve el valor actual como observable (para componentes) */
  getMostrarPrecios(): Observable<boolean> {
    return this.mostrarPrecios$;
  }

  /** Actualiza el valor en el backend y propaga el cambio a todos los suscriptores */
  setMostrarPrecios(mostrar: boolean): Observable<any> {
    const valor = mostrar ? '1' : '0';
    return this.http.put(
      `${this.apiUrl}/configuracion/mostrar_precios`,
      { valor },
      { headers: this.auth.getAuthHeaders() }
    ).pipe(
      tap(() => this.mostrarPreciosSubject.next(mostrar)),
      catchError(err => throwError(() => err))
    );
  }

  /** Valor sincrónico para acceso rápido */
  get mostrarPreciosActual(): boolean {
    return this.mostrarPreciosSubject.getValue();
  }
}

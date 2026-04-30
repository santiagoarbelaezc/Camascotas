import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  registrarVisita(pagina: string, referencia: string = ''): Observable<any> {
    return this.http.post(`${this.apiUrl}/visitas/registrar`, { pagina, referencia });
  }

  registrarVistaProducto(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/producto/${id}/vista`, {});
  }

  getResumen(): Observable<any> {
    return this.http.get(`${this.apiUrl}/visitas/resumen`, { headers: this.auth.getAuthHeaders() });
  }

  getGrafica(): Observable<any> {
    return this.http.get(`${this.apiUrl}/visitas/grafica`, { headers: this.auth.getAuthHeaders() });
  }

  getLogs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/visitas/logs`, { headers: this.auth.getAuthHeaders() });
  }

  getTopProductos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/visitas/productos`, { headers: this.auth.getAuthHeaders() });
  }
}

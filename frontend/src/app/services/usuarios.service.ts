import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ClienteUsuario {
  id: number;
  nombre: string;
  apellidos: string | null;
  correo: string;
  ciudad: string | null;
  edad: number | null;
  rol: string;
  auth_method: 'google' | 'formulario';
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getClientes(): Observable<ClienteUsuario[]> {
    return this.http
      .get<ClienteUsuario[]>(`${this.apiUrl}/usuarios`, {
        headers: this.auth.getAuthHeaders()
      })
      .pipe(catchError(err => throwError(() => err)));
  }
}

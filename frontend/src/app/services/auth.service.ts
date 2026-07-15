import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginCredentials { correo: string; password: string; }
export interface Usuario { id: number; nombre: string; correo: string; rol: string; }
export interface LoginResponse { mensaje: string; token?: string; usuario?: Usuario; requiere_verificacion?: boolean; correo?: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      catchError(err => throwError(() => err))
    );
  }

  registroCliente(datos: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, datos).pipe(
      catchError(err => throwError(() => err))
    );
  }

  loginConGoogle(googleToken: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/google`, { credential: googleToken }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  verificarCodigo(correo: string, codigo: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/verificar-codigo`, { correo, codigo }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  reenviarCodigo(correo: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/reenviar-codigo`, { correo }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  guardarSesion(response: LoginResponse): void {
    if (response.token && response.usuario) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('usuario', JSON.stringify(response.usuario));
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuario(): Usuario | null {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` });
  }

  actualizarUsuarioSesion(nuevoUsuario: any): void {
    localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
  }
}

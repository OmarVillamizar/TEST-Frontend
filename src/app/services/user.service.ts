import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, UserPayload } from '../models/user';

/**
 * UserService — REST-shaped CRUD.
 *
 * Currently backed by an in-memory mock so the UI runs standalone.
 * To wire a real backend:
 *   1. Add `provideHttpClient()` to app.config.ts providers.
 *   2. Inject HttpClient and replace each method body with the
 *      commented HTTP call. Signatures stay identical, so the
 *      component needs no changes.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  // private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/users';

  // --- MOCK STATE (delete once wired) ---------------------------------
  private users: User[] = [
    { id: 1, nombre: 'Ana Torres', activo: true, fechaCreacion: '2025-01-14T09:32:00Z' },
    { id: 2, nombre: 'Bruno Díaz', activo: false, fechaCreacion: '2025-03-02T16:05:00Z' },
    { id: 3, nombre: 'Carla Méndez', activo: true, fechaCreacion: '2025-06-21T11:48:00Z' },
    { id: 4, nombre: 'Diego Rojas', activo: true, fechaCreacion: '2025-09-09T08:15:00Z' },
  ];
  private nextId = 5;
  private readonly latency = 250; // simulate network
  // --------------------------------------------------------------------

  getUsers(): Observable<User[]> {
    // return this.http.get<User[]>(this.baseUrl);
    return of(this.clone(this.users)).pipe(delay(this.latency));
  }

  getUserById(id: number): Observable<User> {
    // return this.http.get<User>(`${this.baseUrl}/${id}`);
    const found = this.users.find((u) => u.id === id);
    return found
      ? of(this.clone(found)).pipe(delay(this.latency))
      : throwError(() => new Error(`Usuario ${id} no encontrado`)).pipe(delay(this.latency));
  }

  createUser(payload: UserPayload): Observable<User> {
    // return this.http.post<User>(this.baseUrl, payload);
    const created: User = {
      id: this.nextId++,
      nombre: payload.nombre,
      activo: payload.activo,
      fechaCreacion: new Date().toISOString(),
    };
    this.users = [...this.users, created];
    return of(this.clone(created)).pipe(delay(this.latency));
  }

  updateUser(id: number, payload: UserPayload): Observable<User> {
    // return this.http.put<User>(`${this.baseUrl}/${id}`, payload);
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Usuario ${id} no encontrado`)).pipe(delay(this.latency));
    }
    const updated: User = { ...this.users[index], ...payload };
    this.users = this.users.map((u) => (u.id === id ? updated : u));
    return of(this.clone(updated)).pipe(delay(this.latency));
  }

  deleteUser(id: number): Observable<void> {
    // return this.http.delete<void>(`${this.baseUrl}/${id}`);
    this.users = this.users.filter((u) => u.id !== id);
    return of(undefined).pipe(delay(this.latency));
  }

  private clone<T>(value: T): T {
    return structuredClone(value);
  }
}

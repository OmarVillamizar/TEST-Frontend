import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { User, UserPayload } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:4000/users';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl).pipe(catchError(this.handleError));
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError));
  }

  createUser(payload: UserPayload): Observable<User> {
    return this.http.post<User>(this.baseUrl, payload).pipe(catchError(this.handleError));
  }

  updateUser(id: number, payload: UserPayload): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, payload).pipe(catchError(this.handleError));
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    const message =
      error.error?.message ??
      (error.status === 0
        ? 'No se pudo contactar al servidor'
        : `Error ${error.status}: ${error.statusText}`);
    return throwError(() => new Error(message));
  }
}

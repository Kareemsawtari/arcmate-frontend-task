import { BehaviorSubject, tap, switchMap, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

const LOGIN_ID_KEY = 'arcmate_loginId';

export interface LoginRequest {
  UserName: string;
  Password: string;
  IPAddress: string;
}

export interface LoginResponse {
  LoginId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loginIdSubject = new BehaviorSubject<string | null>(
    localStorage.getItem(LOGIN_ID_KEY)
  );

  loginId$ = this.loginIdSubject.asObservable();

  constructor(private api: ApiService) {}

  getLoginId(): string | null {
  return this.loginIdSubject.value;
}
private repositoryId: string | null = null;

setRepositoryId(id: string) {
  this.repositoryId = id;
}

getRepositoryId(): string | null {
  return this.repositoryId;
}


  

  login(payload: LoginRequest) {
  return this.api.post<LoginResponse>('LOGIN', payload).pipe(
    tap((res) => {
      if (!res?.LoginId) throw new Error('LoginId missing from response');
      localStorage.setItem(LOGIN_ID_KEY, res.LoginId);
      this.loginIdSubject.next(res.LoginId);
    }),
    // ✅ call TEST silently after successful login
    switchMap(() => this.api.post('TEST', {}))
  );
}


  logout() {
  const id = this.loginIdSubject.value;

  // If already logged out, still clear local state
  if (!id) {
    this.clear();
    return of(null);
  }

  // Call API then clear regardless of success/failure
  return this.api.post('LOGOUT', { LoginId: id }).pipe(
    tap({
      next: () => this.clear(),
      error: () => this.clear(),
    })
  );
}

clear() {
  localStorage.removeItem(LOGIN_ID_KEY);
  this.loginIdSubject.next(null);
  this.repositoryId = null; // ✅ clear selected repo too
}
}

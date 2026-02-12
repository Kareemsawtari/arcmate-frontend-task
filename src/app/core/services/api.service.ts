import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { delay } from 'rxjs/operators';



@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  post<T>(endpoint: string, body: unknown): Observable<T> {
    if (environment.mockApi) {
      return this.mockPost<T>(endpoint, body);
    }

    

    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }
  getDocumentTypes() {
    return this.post<any[]>('GETDOCUMENTTYPES', {});
  }

  searchDocuments(payload: any) {
    return this.post<any[]>('DOCUMENTSEARCH', payload);
  }

  addDocument(payload: any) {
    return this.post<any>('ADDDOCUMENT', payload);
  }

private mockPost<T>(endpoint: string, body: any): Observable<T> {
  console.log('MOCK API CALL:', endpoint);

  if (endpoint === 'LOGIN') {
    return of({ LoginId: 'MOCK_LOGIN_ID_123' } as T).pipe(delay(400));
  }

  if (endpoint === 'TEST') {
    return of({ ok: true } as T).pipe(delay(200));
  }


  if (endpoint === 'LOGOUT') {
    return of({} as T).pipe(delay(200));
  }

  if (endpoint === 'GETREPOS') {
    return of([
      { RepositoryId: '1', Name: 'Repo A' },
      { RepositoryId: '2', Name: 'Repo B' }
    ] as any as T).pipe(delay(400));
  }

  if (endpoint === 'OPENREPO') {
    return of({ ok: true } as T).pipe(delay(300));
  }

    if (endpoint === 'GETDOCUMENTTYPES') {
    return of([
      { Id: '1', Name: 'Invoice' },
      { Id: '2', Name: 'Contract' },
      { Id: '3', Name: 'Receipt' }
    ] as any as T).pipe(delay(300));
  }

  if (endpoint === 'DOCUMENTSEARCH') {
    return of([
      {
        DocumentId: '1001',
        Title: 'Invoice A',
        TypeName: 'Invoice',
        Amount: 500,
        Date: '2026-02-11'
      },
      {
        DocumentId: '1002',
        Title: 'Contract B',
        TypeName: 'Contract',
        Amount: 1200,
        Date: '2026-02-10'
      }
    ] as any as T).pipe(delay(400));
  }

  if (endpoint === 'ADDDOCUMENT') {
    return of({ ok: true } as T).pipe(delay(300));
  }


  return of({} as T);
}


  

  private handleError(err: HttpErrorResponse) {
    const msg =
      (err.error as any)?.Message ||
      err.error?.message ||
      err.message ||
      'Unexpected API error';
    return throwError(() => new Error(msg));
  }
  
}


import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

type AnyObj = Record<string, any>;

export interface MockDocument {
  DocumentId: string;
  Title: string;
  TypeName: string;
  Amount: number;
  Date: string; // YYYY-MM-DD
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.baseUrl;

  // ✅ Stateful mock storage (lives while the page is open)
  private mockDocuments: MockDocument[] = [
    { DocumentId: '1001', Title: 'Invoice A', TypeName: 'Invoice', Amount: 500, Date: '2026-02-11' },
    { DocumentId: '1002', Title: 'Contract B', TypeName: 'Contract', Amount: 1200, Date: '2026-02-10' }
  ];

  constructor(private http: HttpClient) {}

  post<T>(endpoint: string, body: unknown): Observable<T> {
    if (environment.mockApi) {
      return this.mockPost<T>(endpoint, body as AnyObj);
    }

    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  // Convenience wrappers used by your features
  getDocumentTypes() {
    return this.post<any[]>('GETDOCUMENTTYPES', {});
  }

  searchDocuments(payload: AnyObj) {
    return this.post<any[]>('DOCUMENTSEARCH', payload);
  }

  addDocument(payload: AnyObj) {
    return this.post<any>('ADDDOCUMENT', payload);
  }

  // -----------------------
  // Mock API Implementation
  // -----------------------
  private mockPost<T>(endpoint: string, body: AnyObj): Observable<T> {
    console.log('[MOCK API CALL]', endpoint, body ?? {});

    // LOGIN
    if (endpoint === 'LOGIN') {
      return of({ LoginId: 'MOCK_LOGIN_ID_123' } as T).pipe(delay(350));
    }

    // TEST
    if (endpoint === 'TEST') {
      return of({ ok: true } as T).pipe(delay(200));
    }

    // LOGOUT
    if (endpoint === 'LOGOUT') {
      return of({ ok: true } as T).pipe(delay(200));
    }

    // GETREPOS
    if (endpoint === 'GETREPOS') {
      return of(
        [
          { RepositoryId: '1', Name: 'Repo A' },
          { RepositoryId: '2', Name: 'Repo B' }
        ] as any as T
      ).pipe(delay(300));
    }

    // OPENREPO
    if (endpoint === 'OPENREPO') {
      return of({ ok: true } as T).pipe(delay(250));
    }

    // GETDOCUMENTTYPES
    if (endpoint === 'GETDOCUMENTTYPES') {
      return of(
        [
          { Id: '1', Name: 'Invoice' },
          { Id: '2', Name: 'Contract' },
          { Id: '3', Name: 'Receipt' }
        ] as any as T
      ).pipe(delay(250));
    }

    // DOCUMENTSEARCH (filters the in-memory list)
    if (endpoint === 'DOCUMENTSEARCH') {
      const text = this.getString(body, ['Text', 'text', 'Keyword', 'keyword', 'SearchText', 'searchText']);
      const amount = this.getNumber(body, ['Amount', 'amount']);
      const typeName = this.getString(body, [
        'DocumentType',
        'documentType',
        'TypeName',
        'typeName',
        'DocumentTypeName',
        'documentTypeName'
      ]);
      // some APIs use ids; if you pass an id we won't know exact mapping, but we handle the common case:
      const typeId = this.getString(body, ['DocumentTypeId', 'documentTypeId', 'TypeId', 'typeId', 'DocTypeId', 'docTypeId']);

      let results = [...this.mockDocuments];

      // filter by text: match title or id
      if (text) {
        const q = text.toLowerCase();
        results = results.filter(d =>
          d.Title.toLowerCase().includes(q) ||
          d.DocumentId.toLowerCase().includes(q)
        );
      }

      // filter by amount (exact match)
      if (amount !== null) {
        results = results.filter(d => d.Amount === amount);
      }

      // filter by type name (exact match, case-insensitive)
      if (typeName) {
        const tn = typeName.toLowerCase();
        results = results.filter(d => d.TypeName.toLowerCase() === tn);
      }

      // if you send a typeId, we do a best-effort mapping for demo:
      // 1 => Invoice, 2 => Contract, 3 => Receipt
      if (typeId && !typeName) {
        const idMap: Record<string, string> = { '1': 'Invoice', '2': 'Contract', '3': 'Receipt' };
        const mapped = idMap[typeId];
        if (mapped) {
          results = results.filter(d => d.TypeName === mapped);
        }
      }

      return of(results as any as T).pipe(delay(350));
    }

    // ADDDOCUMENT (adds a new document to the in-memory list)
    if (endpoint === 'ADDDOCUMENT') {
      // Your UI currently has Field + Value + Required.
      // We'll convert that into a document-like object for demo purposes.
      const field = this.getString(body, ['Field', 'field']) || 'DocumentName';
      const value = this.getString(body, ['Value', 'value']) || 'New Document';
      const required = this.getBoolean(body, ['Required', 'required']);

      // Optional fields if your UI sends them later:
      const typeName = this.getString(body, ['TypeName', 'typeName']) || 'Invoice';
      const amount = this.getNumber(body, ['Amount', 'amount']) ?? 0;

      const newDoc: MockDocument = {
        DocumentId: this.nextMockId(),
        Title: `${value}${required ? '' : ''}`, // keep simple; you can incorporate `field` if you want
        TypeName: typeName,
        Amount: amount,
        Date: new Date().toISOString().slice(0, 10)
      };

      // Put newest first
      this.mockDocuments.unshift(newDoc);

      return of({ ok: true, created: newDoc } as any as T).pipe(delay(250));
    }

    // default mock response
    return of({} as T).pipe(delay(150));
  }

  private nextMockId(): string {
    // generate a 4-digit-ish id that's not currently used
    const existing = new Set(this.mockDocuments.map(d => d.DocumentId));
    let id = '';
    do {
      id = (Math.floor(Math.random() * 9000) + 1000).toString();
    } while (existing.has(id));
    return id;
  }

  // -----------------------
  // Helpers
  // -----------------------
  private getString(obj: AnyObj, keys: string[]): string {
    for (const k of keys) {
      const v = obj?.[k];
      if (v === undefined || v === null) continue;
      const s = String(v).trim();
      if (s.length) return s;
    }
    return '';
  }

  private getNumber(obj: AnyObj, keys: string[]): number | null {
    for (const k of keys) {
      const v = obj?.[k];
      if (v === undefined || v === null || v === '') continue;
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
    return null;
  }

  private getBoolean(obj: AnyObj, keys: string[]): boolean {
    for (const k of keys) {
      const v = obj?.[k];
      if (v === undefined || v === null) continue;
      if (typeof v === 'boolean') return v;
      if (typeof v === 'string') return v.toLowerCase() === 'true';
      if (typeof v === 'number') return v === 1;
    }
    return false;
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

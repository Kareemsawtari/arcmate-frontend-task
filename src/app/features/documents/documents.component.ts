import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

type DocType = { Id: string; Name: string };
type DocumentResult = {
  DocumentId: string;
  Title: string;
  TypeName: string;
  Amount: number;
  Date?: string;
};

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private auth = inject(AuthService);

  // form
  docTypeId: string = '';
  text: string = '';
  amount: number | null = null;

  // data
  docTypes: DocType[] = [];
  results: DocumentResult[] = [];

  // ui state
  loadingTypes = false;
  loadingSearch = false;
  error: string | null = null;
  info: string | null = null;

  ngOnInit(): void {
    this.loadDocTypes();
  }

  loadDocTypes(): void {
    this.error = null;
    this.loadingTypes = true;

    this.api.getDocumentTypes().subscribe({
      next: (types: any[]) => {

        this.docTypes = types ?? [];
        // optional default
        if (!this.docTypeId && this.docTypes.length) {
          this.docTypeId = this.docTypes[0].Id;
        }
      },
      error: () => {
        this.error = 'Failed to load document types.';
      },
      complete: () => (this.loadingTypes = false),
    });
  }

  search(): void {
    this.error = null;
    this.info = null;
    this.loadingSearch = true;
    this.results = [];

    const payload = {
      DocTypeId: this.docTypeId || null,
      Text: this.text?.trim() || null,
      Amount: this.amount ?? null,
    };

    this.api.searchDocuments(payload).subscribe({
      next: (res: any[]) => {

        this.results = res ?? [];
        if (!this.results.length) this.info = 'No results found.';
      },
      error: () => {
        this.error = 'Search failed. Please try again.';
      },
      complete: () => (this.loadingSearch = false),
    });
  }

  clear(): void {
    this.docTypeId = this.docTypes.length ? this.docTypes[0].Id : '';
    this.text = '';
    this.amount = null;
    this.results = [];
    this.error = null;
    this.info = null;
  }

  goToAdd(): void {
    this.router.navigate(['/documents/add']);
  }
  onLogout(): void {
  this.auth.logout().subscribe(() => {
    this.router.navigate(['/login']);
  });
}

}

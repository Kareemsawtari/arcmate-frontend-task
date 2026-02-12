import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { ReposComponent } from './features/repos/repos.component';
import { DocumentsComponent } from './features/documents/documents.component';
import { AddDocumentComponent } from './features/documents/add-document/add-document.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'repos', component: ReposComponent },
  { path: 'documents', component: DocumentsComponent },
   { path: 'documents/add', component: AddDocumentComponent }, // ✅ ADD THIS

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }, // ✅ keep this LAST
];

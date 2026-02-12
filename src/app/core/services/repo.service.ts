import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Repo {
  RepositoryId: string;
  Name: string;
}

@Injectable({ providedIn: 'root' })
export class RepoService {
  constructor(private api: ApiService) {}

  getRepos(loginId: string) {
    // endpoint name must match your Postman collection (example: "GETREPOS")
    return this.api.post<Repo[]>('GETREPOS', { LoginId: loginId });
  }

  openRepo(loginId: string, repositoryId: string) {
    return this.api.post('OPENREPO', { LoginId: loginId, RepositoryId: repositoryId });
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepoService } from '../../core/services/repo.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router'; // ✅ add

@Component({
  selector: 'app-repos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:24px">
      <h2>Repositories</h2>

      <p *ngIf="loading">Loading...</p>
      <p *ngIf="error" style="color:red">{{ error }}</p>

      <ul *ngIf="repos.length">
        <li *ngFor="let r of repos" style="margin:10px 0">
          <button (click)="open(r.RepositoryId)" style="margin-right:10px">Open</button>
          <b>{{ r.Name }}</b> ({{ r.RepositoryId }})
        </li>
      </ul>
    </div>
  `,
})
export class ReposComponent {
  private repoService = inject(RepoService);
  private auth = inject(AuthService);
  private router = inject(Router); // ✅ add

  repos: any[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    const loginId = this.auth.getLoginId();
    if (!loginId) {
      this.loading = false;
      this.error = 'No LoginId found (please login again)';
      return;
    }

    this.repoService.getRepos(loginId).subscribe({
      next: (data) => { this.repos = data; this.loading = false; },
      error: (e) => { this.error = e.message; this.loading = false; },
    });
  }

  open(repositoryId: string) {
    const loginId = this.auth.getLoginId();
    if (!loginId) return;

    this.repoService.openRepo(loginId, repositoryId).subscribe({
      next: () => {
        // ✅ optional: remember selected repo
        this.auth.setRepositoryId?.(repositoryId); // only if you add it (see below)
        // ✅ go to documents page
        this.router.navigate(['/documents']);
      },
      error: (e) => alert(e.message),
    });
  }
}

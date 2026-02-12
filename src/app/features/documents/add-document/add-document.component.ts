import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-add-document',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-document.component.html',
  styleUrls: ['./add-document.component.scss'],
})
export class AddDocumentComponent {
  private api = inject(ApiService);
  private router = inject(Router);

  field = '';
  value = '';
  required = false;

  saving = false;
  error: string | null = null;
  success: string | null = null;

  submit(): void {
    this.error = null;
    this.success = null;

    if (!this.field.trim() || !this.value.trim()) {
      this.error = 'Field and Value are required.';
      return;
    }

    this.saving = true;

    const payload = {
      Field: this.field.trim(),
      Value: this.value.trim(),
      Required: this.required,
    };

    this.api.addDocument(payload).subscribe({
      next: () => {
        this.success = 'Document added successfully ✅';
        // go back after a short moment OR immediately:
        setTimeout(() => this.router.navigate(['/documents']), 600);
      },
      error: () => {
        this.error = 'Failed to add document.';
      },
      complete: () => (this.saving = false),
    });
  }

  cancel(): void {
    this.router.navigate(['/documents']);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loading = false;
  errorMsg: string | null = null;

  form = this.fb.nonNullable.group({
  UserName: ['', Validators.required],
  Password: ['', Validators.required],
  IPAddress: ['127.0.0.1', Validators.required],
});


  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit() {
    this.errorMsg = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/repos');
      },
      error: (err: Error) => {
        this.loading = false;
        this.errorMsg = err.message;
      },
    });
  }
}

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  Validators,
  FormBuilder,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loading = false;
  loginForm = inject(FormBuilder).group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  private usersService = inject(UsersService);

  get passwordControl() {
    return this.loginForm.get('password');
  }

  showErrors(control: AbstractControl | null) {
    return control?.dirty && control?.invalid;
  }

  submit() {
    if (this.loginForm.pristine || this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    const { email, password } = this.loginForm.value;
    this.usersService.login(email || '', password || '').subscribe({
      next: () => {
        this.loading = false;
        alert('Logged in');
      },
      error: ({ error }) => {
        this.loading = false;
        alert(error.error || 'An error occurred');
      },
    });
  }
}

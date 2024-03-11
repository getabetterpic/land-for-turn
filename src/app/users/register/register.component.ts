import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  submitted = false;
  loading = false;
  registerForm = inject(FormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    username: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    password: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(100)],
    ],
    passwordConfirm: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(100)],
    ],
  });

  private usersService = inject(UsersService);

  public get passwordControl() {
    return this.registerForm.get('password');
  }

  public showErrors(control: AbstractControl | null): boolean {
    return control !== null && control.dirty && control.invalid;
  }

  public submit() {
    if (this.registerForm.pristine || this.registerForm.invalid) {
      return;
    }
    this.loading = true;
    const { email, username, password, passwordConfirm } =
      this.registerForm.value;
    const registration = {
      email: email || '',
      username: username || '',
      password: password || '',
      passwordConfirm: passwordConfirm || '',
    };
    this.usersService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
        this.registerForm.reset();
        alert('Registration successful');
      },
      error: () => {
        this.loading = false;
        alert('An error occurred. Please try again.');
      },
    });
  }
}

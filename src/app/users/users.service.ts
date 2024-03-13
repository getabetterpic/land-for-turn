import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

interface UserRegistration {
  email: string | null;
  username: string | null;
  password: string | null;
  passwordConfirm: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);

  public register(
    userRegistration: Partial<UserRegistration>,
  ): Observable<any> {
    return this.http.post('/api/users/register', userRegistration);
  }

  public login(email: string, password: string): Observable<any> {
    return this.http.post('/api/users/login', { email, password });
  }
}

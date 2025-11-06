import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.currentUserSignal.set(JSON.parse(userJson));
    }
  }

  login(email: string, password: string): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: '1',
          email,
          name: 'Mohammed Alami',
          role: 'admin',
          subscription: {
            plan: 'pro',
            status: 'active',
            expiresAt: new Date('2025-12-31')
          },
          createdAt: new Date()
        };
        this.currentUserSignal.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        resolve(user);
      }, 500);
    });
  }

  register(email: string, password: string, name: string): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: '1',
          email,
          name,
          role: 'admin',
          subscription: {
            plan: 'free',
            status: 'active'
          },
          createdAt: new Date()
        };
        this.currentUserSignal.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        resolve(user);
      }, 500);
    });
  }

  logout() {
    this.currentUserSignal.set(null);
    localStorage.removeItem('currentUser');
  }

  resetPassword(email: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}

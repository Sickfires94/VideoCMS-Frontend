// src/app/core/services/token-storage.service.ts
import { Injectable } from '@angular/core';
import { User } from '../../features/auth/models/user.model';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'current_user';

@Injectable({
  providedIn: 'root' // Singleton, accessible app-wide
})
export class TokenStorageService {

  constructor() { }

  /**
   * Saves the authentication token to local storage.
   * @param token The JWT token to store.
   */
  public saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Retrieves the authentication token from local storage.
   * @returns The stored token or null if not found.
   */
  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Saves user details to local storage.
   * @param user The User object to store.
   */
  public saveUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Retrieves user details from local storage.
   * @returns The stored User object or null if not found/parse error.
   */
  public getUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      console.error('Error parsing stored user data:', e);
      this.clear(); // Clear potentially corrupt data
      return null;
    }
  }

  /**
   * Clears both the token and user data from local storage.
   */
  public clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
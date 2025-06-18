// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../features/auth/services/auth.facade'; // Depend on AuthFacade

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authFacade: AuthFacade, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authFacade.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true; // User is authenticated, allow access
        } else {
          // User is not authenticated, redirect to login page
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}
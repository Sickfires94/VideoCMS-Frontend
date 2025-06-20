// src/app/core/guards/public.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../features/auth/services/auth.facade'; // Depend on AuthFacade

@Injectable({
  providedIn: 'root'
})
export class PublicGuard implements CanActivate {
  constructor(private authFacade: AuthFacade, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authFacade.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          return true; // User is not authenticated, allow access to public routes
        } else {
          // User is authenticated, redirect to dashboard or another protected page
          return this.router.createUrlTree(['/search']);
        }
      })
    );
  }
}
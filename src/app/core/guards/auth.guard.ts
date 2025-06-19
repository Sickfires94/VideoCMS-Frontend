// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthFacade } from '../../features/auth/services/auth.facade';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authFacade: AuthFacade, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authFacade.isAuthenticated$.pipe(
      take(1), // Take only the first value and complete
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
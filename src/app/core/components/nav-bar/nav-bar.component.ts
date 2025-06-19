// src/app/core/components/nav-bar/nav-bar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Import Router and RouterModule
import { Subscription } from 'rxjs';
import { User } from '../../../features/auth/models/user.model';
import { AuthFacade } from '../../../features/auth/services/auth.facade';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule], // RouterModule needed for [routerLink]
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  currentUser: User | null = null;
  private authStatusSubscription!: Subscription;
  private currentUserSubscription!: Subscription;

  constructor(
    private authFacade: AuthFacade,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    // Subscribe to authentication status changes
    this.authStatusSubscription = this.authFacade.isAuthenticated$.subscribe(
      (status: boolean) => {
        this.isAuthenticated = status;
      }
    );

    // Subscribe to current user changes
    this.currentUserSubscription = this.authFacade.currentUser$.subscribe(
      (user: User | null) => {
        this.currentUser = user;
      }
    );
  }

  /**
   * Handles the logout action.
   */
  onLogout(): void {
    this.authFacade.logout();
    this.notificationService.showInfo('You have successfully logged out.');
    // The logout method in AuthFacade already navigates to /login
  }

  ngOnDestroy(): void {
    if (this.authStatusSubscription) {
      this.authStatusSubscription.unsubscribe();
    }
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }
}

    // src/app/app.component.ts
    import { Component } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { RouterOutlet } from '@angular/router';
import { GlobalNotificationComponent } from './core/components/global-notification.component';
import { NavBarComponent } from './core/components/nav-bar/nav-bar.component';

    
    @Component({
      selector: 'app-root',
      standalone: true, // Mark as standalone
      imports: [
        CommonModule,
        RouterOutlet,
        GlobalNotificationComponent,
        NavBarComponent // NEW: Import the NavBarComponent
      ],
      template: `
        <!-- NEW: Add the navigation bar at the top -->
        <app-nav-bar></app-nav-bar>

        <!-- Global notification component will display messages from NotificationService -->
        <app-global-notification></app-global-notification>

        <!-- This is where your routes will be rendered -->
        <router-outlet></router-outlet>
      `,
      styleUrls: ['./app.component.scss']
    })
    export class AppComponent {
      title = 'YourVideoCMSApp';
    }
    
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
 { path: '', redirectTo: '', pathMatch: 'full' }, // Default redirect

  // Public routes (auth feature)
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Protected routes
//   {
//         // Protected routes here
//   },
  // Add more protected routes/modules here
  // {
  //   path: 'products',
  //   loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES),
  //   canActivate: [AuthGuard]
  // },

  // Wildcard route for 404 (optional)
  { path: '**', redirectTo: '/login' } // Or a dedicated 404 component
];
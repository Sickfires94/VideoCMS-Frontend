import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../../core/api/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CategoryDto } from '../../../shared/models/category';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly baseUrl = '/Categories'; // Base URL for categories API (Note: OpenAPI uses capital C)

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  /**
   * Fetches all categories from the backend and filters them by name on the frontend.
   * OpenAPI does not provide a direct search endpoint for categories.
   * @param query The search query for categories.
   * @returns An Observable that emits an array of CategoryDto matching the query.
   */
  searchCategories(query: string): Observable<CategoryDto[]> {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) {
      // If query is empty, return an empty array or all categories, depending on desired UX.
      // For a search box, returning empty is common if no query is provided.
      return of([]);
    }
    // Use the new backend search endpoint: /api/Categories/search/{categoryName}
    const url = `${this.baseUrl}/search/${encodeURIComponent(normalizedQuery)}`; // Encode the query
    return this.apiService.get<CategoryDto[]>(url).pipe(
      catchError(error => {
        this.notificationService.showError('Failed to search categories.');
        console.error('Error searching categories:', error);
        return throwError(() => new Error('Category search failed.'));
      })
    );
  }

  createCategory(categoryName: string): Observable<CategoryDto> {
    const payload = { categoryName: categoryName }; // Payload for POST /api/Categories
    return this.apiService.post<CategoryDto>(this.baseUrl, payload).pipe(
      catchError(error => {
        this.notificationService.showError('Failed to create new category.');
        console.error('Error creating category:', error);
        return throwError(() => new Error('Category creation failed.'));
      })
    );
  }
}
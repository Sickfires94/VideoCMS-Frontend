// src/app/features/categories/services/category.service.ts
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
  private readonly baseUrl = '/Categories';

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  /**
   * Fetches categories matching a query from the backend.
   * @param query The search query for categories.
   * @returns An Observable that emits an array of CategoryDto matching the query.
   */
  searchCategories(query: string): Observable<CategoryDto[]> {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) {
      return of([]);
    }
    const url = `${this.baseUrl}/search/${encodeURIComponent(normalizedQuery)}`;
    return this.apiService.get<CategoryDto[]>(url).pipe(
      catchError(error => {
        this.notificationService.showError('Failed to search categories.');
        console.error('Error searching categories:', error);
        return throwError(() => new Error('Category search failed.'));
      })
    );
  }

  /**
   * Creates a new category.
   * @param categoryName The name of the new category.
   * @param parentCategoryId Optional: The ID of the parent category.
   * @returns An Observable that emits the newly created CategoryDto.
   */
  createCategory(categoryName: string, parentCategoryName: string | null = null): Observable<CategoryDto> { // FIX: Changed parentCategoryName to parentCategoryId
    const payload: any = { categoryName: categoryName };
    if (parentCategoryName !== null) { // Check for null, as 0 could be a valid ID
      payload.parentCategoryName = parentCategoryName; // FIX: Assign to categoryParentId
    }

    return this.apiService.post<CategoryDto>(this.baseUrl, payload).pipe(
      catchError(error => {
        this.notificationService.showError('Failed to create new category.');
        console.error('Error creating category:', error);
        return throwError(() => new Error('Category creation failed.'));
      })
    );
  }
}
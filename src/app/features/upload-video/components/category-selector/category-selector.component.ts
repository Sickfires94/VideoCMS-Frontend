import { CommonModule } from "@angular/common";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { debounceTime, distinctUntilChanged, tap, filter, switchMap, catchError, of, finalize } from "rxjs";
import { LoadingSpinnerComponent } from "../../../../shared/components/loading-spinner/loading-spinner.component";
import { CategoryDto } from "../../../../shared/models/category";
import { CategoryService } from "../../services/category.service";

@Component({
  selector: 'app-category-selector',
  standalone: true, // Mark as standalone
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent], // Import necessary modules
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.scss']
})
export class CategorySelectorComponent implements OnInit {
  @Input() selectedCategory: CategoryDto | null = null;
  @Output() categorySelected = new EventEmitter<CategoryDto | null>();

  categorySearchControl = new FormControl('');
  searchResults: CategoryDto[] = [];
  isLoadingResults: boolean = false;
  showCreateOption: boolean = false; // Control visibility of "Create New Category" option

  constructor(private categoryService: CategoryService) { } // Injects CategoryService (Model)

  ngOnInit(): void {
    this.categorySearchControl.valueChanges.pipe(
      debounceTime(300), // Wait for 300ms after the last keystroke
      distinctUntilChanged(), // Only emit if value is different from previous value
      tap(() => {
        this.isLoadingResults = true;
        this.searchResults = []; // Clear previous results
        this.showCreateOption = false; // Reset create option visibility

        // If the user types after a category was selected, deselect it.
        // This is crucial for allowing editing to remove the "selected" state.
        if (this.selectedCategory && this.categorySearchControl.value?.trim().toLowerCase() !== this.selectedCategory.categoryName.toLowerCase()) {
          this.selectedCategory = null;
          this.categorySelected.emit(null);
        }

        if (!this.categorySearchControl.value) { // If search query is empty, clear results and stop loading
          this.isLoadingResults = false;
        }
      }),
      filter(query => (query && query.length > 2) || query === ''), // Only search if query is > 2 chars or empty to clear
      switchMap(query => {
        if (query) {
          return this.categoryService.searchCategories(query).pipe( // Interacts with Model
            catchError(error => {
              console.error('Error in category search:', error);
              return of([]); // Return an empty array on error
            })
          );
        } else {
          return of([]); // Return empty array if query is empty
        }
      })
    ).subscribe(results => {
      this.searchResults = results;
      this.isLoadingResults = false;

      // Determine if "Create New Category" option should be shown
      const currentQuery = this.categorySearchControl.value?.trim();
      this.showCreateOption = !!(currentQuery && currentQuery.length > 0 && results.length === 0);
    });

    // If an initial selected category is provided, set the input value
    if (this.selectedCategory) {
      this.categorySearchControl.setValue(this.selectedCategory.categoryName, { emitEvent: false }); // Use categoryName
    }
  }

  /**
   * Selects a category from the search results and emits it.
   * Clears search results and sets the input value.
   * @param category The selected CategoryDto.
   */
  selectCategory(category: CategoryDto): void {
    this.selectedCategory = category;
    this.categorySearchControl.setValue(category.categoryName, { emitEvent: false }); // Use categoryName
    this.searchResults = []; // Clear search results after selection
    this.showCreateOption = false; // Hide create option after selection
    this.categorySelected.emit(category);
  }

  /**
   * Clears the selected category.
   */
  clearCategory(): void {
    this.selectedCategory = null;
    this.categorySearchControl.setValue('');
    this.searchResults = [];
    this.showCreateOption = false; // Hide create option
    this.categorySelected.emit(null);
  }

  /**
   * Handles input blur. If a category is selected but the input value changes,
   * it effectively deselects the category.
   */
  onBlur(): void {
    const currentValue = this.categorySearchControl.value?.trim().toLowerCase();

    // Check if a category is selected AND the current input value
    // does NOT match the selected category's name.
    if (this.selectedCategory && currentValue !== this.selectedCategory.categoryName.toLowerCase()) {
      this.selectedCategory = null; // Deselect the category
      this.categorySelected.emit(null); // Emit null to parent
    }

    // Always clear search results and hide create option on blur,
    // unless a new search will be triggered by valueChanges.
    // This is to clean up dropdowns after user interaction.
    // The valueChanges pipe will re-populate if the query is valid.
    setTimeout(() => { // Keep a small delay to allow click events on search results to fire before clearing
        this.searchResults = [];
        this.showCreateOption = false;
    }, 100);
  }

  /**
   * Creates a new category using the current search input value.
   */
  onCreateNewCategory(): void {
    const newCategoryName = this.categorySearchControl.value?.trim();
    if (!newCategoryName) {
      return;
    }

    this.isLoadingResults = true; // Show loading while creating
    this.categoryService.createCategory(newCategoryName).pipe(
      finalize(() => this.isLoadingResults = false)
    ).subscribe({
      next: (createdCategory: CategoryDto) => {
        // Automatically select the newly created category
        this.selectCategory(createdCategory);
      },
      error: (err: any) => {
        console.error('Failed to create category:', err);
      }
    });
  }
}
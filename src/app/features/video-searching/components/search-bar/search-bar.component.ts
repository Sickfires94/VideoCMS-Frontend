// src/app/features/video-searching/components/search-bar/search-bar.component.ts
import { Component, EventEmitter, Output, OnInit, Input, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError, tap, finalize } from 'rxjs/operators';
import { Subject, of, throwError } from 'rxjs';

import { VideoSearchingService } from '../../services/video-search.service';
import { CategoryDto } from '../../../../shared/models/category';


@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() initialSearchTerm: string = '';
  @Output() searchSubmitted = new EventEmitter<{ term: string, categoryName?: string }>();

  searchFormControl = new FormControl<string>('', { nonNullable: true });

  suggestedTerms: string[] = [];
  isLoadingSuggestions: boolean = false;
  showSuggestions: boolean = false;

  categoryTree: CategoryDto[] = [];
  currentCategoryLevel: CategoryDto[] = [];
  filteredCategories: CategoryDto[] = [];
  selectedCategory: CategoryDto | null = null;
  categorySelectionHistory: { selectedCategoryAtLevel: CategoryDto | null, previousLevelCategories: CategoryDto[] }[] = [];

  showCategoryDropdown: boolean = false;
  isLoadingCategories: boolean = false;
  isLoadingCategorySearch: boolean = false;

  categorySearchFormControl = new FormControl<string>('', { nonNullable: true });
  isSearchingCategories: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private videoSearchingService: VideoSearchingService,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    // ----------------------------------------------------------------------
    // Main Search Bar Autocomplete Logic
    // ----------------------------------------------------------------------
    this.searchFormControl.setValue(this.initialSearchTerm);

    this.searchFormControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(term => {
        console.groupCollapsed('SearchBarComponent: Autocomplete Flow for term:', term);
        console.log('  Triggering suggestion fetch...');
        this.isLoadingSuggestions = true;
        this.showSuggestions = true;
        console.log('  State after trigger: isLoadingSuggestions =', this.isLoadingSuggestions, ', showSuggestions =', this.showSuggestions);

        if (term.length < 2) {
          console.log('  Term too short, returning empty suggestions.');
          this.suggestedTerms = [];
          this.isLoadingSuggestions = false;
          console.groupEnd();
          return of([]);
        }

        return this.videoSearchingService.getSearchSuggestions(term).pipe(
          tap(suggestions => {
            console.log('  API call success, received suggestions:', suggestions);
          }),
          catchError(error => {
            console.error('  API call error during suggestions fetch:', error);
            this.suggestedTerms = [];
            this.isLoadingSuggestions = false;
            this.showSuggestions = false;
            console.groupEnd();
            return of([]);
          })
        );
      })
    ).subscribe(suggestions => {
      console.log('SearchBarComponent: Autocomplete suggestions received in subscribe:', suggestions);
      this.suggestedTerms = suggestions;
      this.isLoadingSuggestions = false;
      console.log('  State after subscribe: isLoadingSuggestions =', this.isLoadingSuggestions, ', suggestedTerms.length =', this.suggestedTerms.length);
      console.groupEnd();
    });

    // ----------------------------------------------------------------------
    // Category Tree Loading Logic (Initial Load)
    // ----------------------------------------------------------------------
    this.isLoadingCategories = true;
    this.videoSearchingService.getCategoriesTree().pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoadingCategories = false;
        console.log('SearchBarComponent: Categories fetch FINALIZE. isLoadingCategories =', this.isLoadingCategories);
      })
    ).subscribe({
      next: (categories) => {
        this.categoryTree = categories;
        this.currentCategoryLevel = categories; // Initialize with top-level categories for browsing
        this.filteredCategories = categories; // Initialize filtered categories for browsing view
        console.log('SearchBarComponent: Categories tree loaded:', categories);
      },
      error: (err) => {
        console.error('SearchBarComponent: Failed to load category tree:', err);
      }
    });

    // ----------------------------------------------------------------------
    // Category Search Input Logic (API Call)
    // ----------------------------------------------------------------------
    this.categorySearchFormControl.valueChanges.pipe(
      debounceTime(300), // Debounce to prevent too many API calls
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(searchTerm => {
        this.isSearchingCategories = !this.stringIsNullOrWhiteSpace(searchTerm);
        if (this.isSearchingCategories) {
          this.isLoadingCategorySearch = true; // Set loading state
          console.log('SearchBarComponent: Triggering category search API call for:', searchTerm);
          return this.videoSearchingService.searchCategories(searchTerm).pipe( // CALLING THE API METHOD
            catchError(error => {
              console.error('SearchBarComponent: Error during category search API call:', error);
              return of([]); // Return empty array on error to prevent breaking
            }),
            finalize(() => {
              this.isLoadingCategorySearch = false; // Unset loading state
              console.log('SearchBarComponent: Category search API call FINALIZE. isLoadingCategorySearch =', this.isLoadingCategorySearch);
            })
          );
        } else {
          // If search term is empty, revert to showing the current browsing level
          this.isLoadingCategorySearch = false; // No search in progress
          return of(this.currentCategoryLevel); // Show current browsing level when search input is empty
        }
      })
    ).subscribe(categories => {
      console.log('SearchBarComponent: Category search results received:', categories);
      this.filteredCategories = categories;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // HostListener for global click events to close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      if (this.showCategoryDropdown) {
        this.showCategoryDropdown = false;
        console.log('SearchBarComponent: Category dropdown closed by click outside.');
        // When closing, always clear the search input and reset filtered categories
        this.categorySearchFormControl.setValue('');
        this.isSearchingCategories = false;
        this.filteredCategories = this.currentCategoryLevel;
      }
      if (this.showSuggestions) {
        this.showSuggestions = false;
        console.log('SearchBarComponent: Search suggestions closed by click outside.');
      }
    }
  }

  // ----------------------------------------------------------------------
  // Main Search and Term Selection
  // ----------------------------------------------------------------------

  onSearch(): void {
    console.log('SearchBarComponent: onSearch() called. Term:', this.searchFormControl.value, 'Category:', this.selectedCategory?.categoryName);
    this.showSuggestions = false;
    this.showCategoryDropdown = false;

    this.searchSubmitted.emit({
      term: this.searchFormControl.value,
      categoryName: this.selectedCategory?.categoryName
    });
  }

  onSearchTermSelect(term: string): void {
    console.log('SearchBarComponent: onSearchTermSelect() called with term:', term);
    this.searchFormControl.setValue(term);
    this.showSuggestions = false;
    this.onSearch();
  }

  onSearchInputBlur(): void {
    console.log('SearchBarComponent: onSearchInputBlur() called.');
    setTimeout(() => {
      if (!this.elementRef.nativeElement.contains(document.activeElement)) {
         this.showSuggestions = false;
         console.log('SearchBarComponent: showSuggestions set to FALSE after blur timeout.');
      }
    }, 100);
  }

  clearSearchTerm(): void {
    console.log('SearchBarComponent: clearSearchTerm() called.');
    this.searchFormControl.setValue('');
    this.selectedCategory = null;
    this.currentCategoryLevel = this.categoryTree;
    this.categorySelectionHistory = [];
    this.categorySearchFormControl.setValue('');
    this.isSearchingCategories = false;
    this.filteredCategories = this.categoryTree; // Reset filtered categories to top level
    this.onSearch();
  }

  // ----------------------------------------------------------------------
  // Category Dropdown and Navigation
  // ----------------------------------------------------------------------

  toggleCategoryDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showCategoryDropdown = !this.showCategoryDropdown;
    
    if (this.showCategoryDropdown) {
      // When opening, ensure dropdown shows the current browsing level, not stale search results
      this.filteredCategories = this.currentCategoryLevel;
      this.categorySearchFormControl.setValue(''); // Clear search input on open
      this.isSearchingCategories = false; // Reset search state
      
      // If we haven't loaded categories yet, or currentLevel is empty after navigating,
      // re-initialize currentCategoryLevel to the tree top level for browsing.
      if (this.currentCategoryLevel.length === 0 && this.categoryTree.length > 0) {
          this.currentCategoryLevel = this.categoryTree;
          this.filteredCategories = this.categoryTree;
      }
      setTimeout(() => {
        document.getElementById('categorySearchInput')?.focus();
      }, 0);
    } else {
      // When closing, always clear the search input and reset filteredCategories
      this.categorySearchFormControl.setValue('');
      this.isSearchingCategories = false;
      this.filteredCategories = this.currentCategoryLevel; // Revert to browsing state
    }
    console.log('SearchBarComponent: toggleCategoryDropdown. showCategoryDropdown:', this.showCategoryDropdown);
  }

  /**
   * Handles a final category selection that closes the dropdown.
   * This method always resets the internal browsing state and clears the category search input.
   * @param category The category selected, or null for "All Categories".
   */
  onCategorySelect(category: CategoryDto | null): void {
    this.selectedCategory = category;
    this.showCategoryDropdown = false; // Hide dropdown after explicit selection
    
    // Reset internal category browsing state for the next time dropdown is opened
    this.currentCategoryLevel = this.categoryTree;
    this.categorySelectionHistory = [];
    this.filteredCategories = this.categoryTree; // Reset filtered categories to top level
    
    this.categorySearchFormControl.setValue(''); // ALWAYS clear search input on final selection
    this.isSearchingCategories = false; // Reset search state

    console.log('SearchBarComponent: Category selected for filter:', category?.categoryName || 'All Categories');
    this.onSearch();
  }

  /**
   * Handles a click on a category item within the dropdown.
   * Behavior depends on whether we are currently searching or browsing.
   * @param category The category that was clicked.
   * @param event The mouse event, used for stopPropagation.
   */
  onCategoryClickInList(category: CategoryDto, event: MouseEvent): void {
    event.stopPropagation(); // CRITICAL: Prevent click from bubbling up to document and closing dropdown
    
    if (this.isSearchingCategories) {
        // SCENARIO: User clicked a result from an active category search.
        // This is a final selection, but we want the search query to persist.
        this.selectedCategory = category;
        this.categorySearchFormControl.setValue(category.categoryName); // <-- THIS IS THE PERSISTENCE
        this.showCategoryDropdown = false; // Close the dropdown after selection

        // Reset internal browsing state for next time dropdown is opened for browsing
        this.currentCategoryLevel = this.categoryTree;
        this.categorySelectionHistory = [];
        this.filteredCategories = this.categoryTree; // Reset filtered categories to top level

        this.isSearchingCategories = false; // No longer searching, a category is now selected
        console.log('SearchBarComponent: Category selected from search results (query persisted):', category.categoryName);
        this.onSearch(); // Trigger main video search
        return; // Exit here, as behavior is complete
    }

    // SCENARIO: User is browsing the category tree (not actively searching within the dropdown).
    if (category.children && category.children.length > 0) {
      // Drill down into a sub-category
      console.log('SearchBarComponent: Drilling down to:', category.categoryName);

      this.categorySelectionHistory.push({
        selectedCategoryAtLevel: this.selectedCategory, // Store what was selected before drilling down
        previousLevelCategories: this.currentCategoryLevel // Store the list of categories currently displayed
      });

      this.currentCategoryLevel = category.children; // Update to show children
      this.selectedCategory = category; // Update the display in the button/breadcrumbs to show the current "level" category
      this.filteredCategories = this.currentCategoryLevel; // Show children for browsing
      
      this.categorySearchFormControl.setValue(''); // Clear category search input when drilling down (browsing now)
      this.isSearchingCategories = false; // Not searching anymore, now browsing
      
    } else {
      // Leaf node clicked during browsing, treat as final selection
      console.log('SearchBarComponent: Selecting leaf category during browsing:', category.categoryName);
      // Calls onCategorySelect, which will clear the categorySearchFormControl and close dropdown
      this.onCategorySelect(category);
    }
  }

  navigateUpCategories(event: MouseEvent): void {
    event.stopPropagation(); // CRITICAL: Prevent this click from bubbling up
    if (this.categorySelectionHistory.length > 0) {
      const lastState = this.categorySelectionHistory.pop();
      if (lastState) {
        this.selectedCategory = lastState.selectedCategoryAtLevel;
        this.currentCategoryLevel = lastState.previousLevelCategories;
        this.filteredCategories = this.currentCategoryLevel;
        this.categorySearchFormControl.setValue(''); // Clear any active category search
        this.isSearchingCategories = false;
        console.log('SearchBarComponent: Navigated up. Current level count:', this.currentCategoryLevel.length);
      }
    } else {
      this.selectedCategory = null;
      this.currentCategoryLevel = this.categoryTree;
      this.filteredCategories = this.categoryTree;
      this.categorySearchFormControl.setValue(''); // Clear category search input when navigating up to root
      this.isSearchingCategories = false;
      console.log('SearchBarComponent: Already at top level categories, resetting to All.');
    }
  }

  /**
   * Handles Enter key press in the category search input.
   * Selects the first matching category if available and persists the query.
   */
  onCategorySearchEnter(): void {
    if (this.filteredCategories.length > 0) {
      const selectedCategory = this.filteredCategories[0];
      this.selectedCategory = selectedCategory;
      this.categorySearchFormControl.setValue(selectedCategory.categoryName); // Persist query
      this.showCategoryDropdown = false; // Close dropdown

      // Reset internal browsing state
      this.currentCategoryLevel = this.categoryTree;
      this.categorySelectionHistory = [];
      this.filteredCategories = this.categoryTree;

      this.isSearchingCategories = false;
      console.log('SearchBarComponent: Category selected by Enter (query persisted):', selectedCategory.categoryName);
      this.onSearch(); // Trigger main video search
    } else {
      console.warn('No matching categories found to select on Enter.');
    }
  }

  private stringIsNullOrWhiteSpace(value: string | null | undefined): boolean {
    return value === null || value === undefined || value.trim() === '';
  }
}
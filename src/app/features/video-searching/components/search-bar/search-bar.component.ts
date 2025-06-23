// src/app/features/video-searching/components/search-bar/search-bar.component.ts
import { Component, EventEmitter, Output, OnInit, Input, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError, tap } from 'rxjs/operators'; // Added catchError, tap
import { Subject, of, throwError } from 'rxjs'; // Added of, throwError for better error handling in switchMap

import { VideoSearchingService } from '../../services/video-search.service';

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
  @Output() searchSubmitted = new EventEmitter<string>();

  searchFormControl = new FormControl<string>('', { nonNullable: true });

  suggestedTerms: string[] = [];
  isLoadingSuggestions: boolean = false;
  showSuggestions: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(private videoSearchingService: VideoSearchingService) { }

  ngOnInit(): void {
    this.searchFormControl.setValue(this.initialSearchTerm);

    this.searchFormControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(term => {
        console.groupCollapsed('SearchBarComponent: Autocomplete Flow for term:', term); // Start group
        console.log('  Triggering suggestion fetch...');
        this.isLoadingSuggestions = true; // Start loading
        this.showSuggestions = true;     // Show dropdown
        console.log('  State after trigger: isLoadingSuggestions =', this.isLoadingSuggestions, ', showSuggestions =', this.showSuggestions);

        if (term.length < 2) {
          console.log('  Term too short, returning empty suggestions.');
          this.suggestedTerms = []; // Clear previous suggestions
          this.isLoadingSuggestions = false; // Turn off loading immediately
          console.groupEnd(); // End group
          return of([]); // Return an empty observable
        }

        return this.videoSearchingService.getSearchSuggestions(term).pipe(
          tap(suggestions => {
            console.log('  API call success, received suggestions:', suggestions);
            // This tap is purely for logging; the subscribe block handles assignment
          }),
          catchError(error => {
            console.error('  API call error during suggestions fetch:', error);
            this.suggestedTerms = []; // Clear suggestions on error
            this.isLoadingSuggestions = false; // Stop loading on error
            this.showSuggestions = false; // Hide suggestions on error
            console.groupEnd(); // End group
            return of([]); // Return an empty observable to gracefully continue the stream
          })
        );
      })
      // Removed finalize here, as isLoadingSuggestions is managed in subscribe/catchError/term.length < 2
    ).subscribe(suggestions => {
      console.log('SearchBarComponent: Autocomplete suggestions received in subscribe:', suggestions);
      this.suggestedTerms = suggestions;
      this.isLoadingSuggestions = false; // --- FIX: Set isLoadingSuggestions to false AFTER data is available ---
      console.log('  State after subscribe: isLoadingSuggestions =', this.isLoadingSuggestions, ', suggestedTerms.length =', this.suggestedTerms.length);
      console.groupEnd(); // End group for this specific stream execution
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(): void {
    console.log('SearchBarComponent: onSearch() called (button click/suggestion select).');
    this.showSuggestions = false;
    this.searchSubmitted.emit(this.searchFormControl.value);
  }

  onSearchTermSelect(term: string): void {
    console.log('SearchBarComponent: onSearchTermSelect() called with term:', term);
    this.searchFormControl.setValue(term);
    this.showSuggestions = false;
    this.onSearch();
  }

  onSearchInputBlur(): void {
    console.log('SearchBarComponent: onSearchInputBlur() called.');
    // Delay hiding suggestions slightly to allow click on suggestion before blur hides it
    setTimeout(() => {
      this.showSuggestions = false;
      console.log('SearchBarComponent: showSuggestions set to FALSE after blur timeout.');
    }, 100);
  }

  clearSearchTerm(): void {
    console.log('SearchBarComponent: clearSearchTerm() called.');
    this.searchFormControl.setValue('');
    this.onSearch();
  }
}
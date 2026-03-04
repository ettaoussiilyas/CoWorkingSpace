import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppCurrencyPipe } from '../../../../core/pipes/app-currency.pipe';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { Center, Space, SpaceType } from '../../../../core/models/catalogue.models';
import { ReviewListComponent } from '../review-list/review-list.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-space-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, AppCurrencyPipe, ReviewListComponent],
  template: `
    <div class="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div class="max-w-7xl mx-auto">
        <div *ngIf="center()" class="mb-12">
          <button routerLink="/centers" class="inline-flex items-center text-primary font-bold mb-6 hover:text-teal-600 transition-all">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            {{ 'CATALOGUE.BACK_LINK' | translate }}
          </button>
          
          <div class="flex flex-col md:flex-row gap-12 items-start">
            <div class="flex-grow">
              <h1 class="text-4xl font-black text-gray-900 font-tight mb-4">{{ center()?.name }}</h1>
              <p class="text-xl text-gray-500 mb-6 max-w-2xl">{{ center()?.description }}</p>
              <div class="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
                <span class="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">📍 {{ center()?.city }}, {{ center()?.address }}</span>
                <span class="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">⏰ {{ center()?.openingHours }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
          <h2 class="text-2xl font-black text-gray-900">{{ 'CATALOGUE.AVAILABLE_SPACES' | translate }}</h2>
          <button [routerLink]="['/admin/spaces/new']" [queryParams]="{centerId: center()?.centerId}"
                  class="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-teal-600 transition-all text-sm shadow-md">
            + New Space
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div *ngFor="let space of spaces()" 
               class="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col group overflow-hidden">
            <!-- Space Image -->
            <div class="h-48 overflow-hidden relative">
              <img [src]="(space.photos && space.photos.length > 0) ? space.photos[0] : 'assets/images/placeholder.jpg'" 
                   [alt]="space.name"
                   class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
              <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm" [ngClass]="getTypeClass(space.type)">
                {{ space.type }}
              </div>
            </div>

            <div class="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div class="flex-grow min-w-0">
                <div class="flex items-center gap-3 mb-3">
                  <span class="text-xs text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">{{ space.capacity }} {{ 'CATALOGUE.PEOPLE' | translate }}</span>
                  <div class="flex gap-1" *ngIf="space.averageRating > 0">
                    <span class="text-yellow-400">★</span>
                    <span class="text-gray-900 font-bold text-xs">{{ space.averageRating }}</span>
                  </div>
                </div>
                <h3 class="text-2xl font-black text-gray-900 mb-3 truncate">{{ space.name }}</h3>
                <p class="text-gray-500 text-sm mb-6 line-clamp-2">{{ space.description }}</p>
                
                <!-- Amenities -->
                <div class="flex flex-wrap gap-2 mb-2">
                  <span *ngFor="let am of space.amenities" class="text-[10px] font-black uppercase tracking-tighter bg-teal-50 text-teal-600 px-2 py-1 rounded-md">
                    {{ am }}
                  </span>
                </div>
              </div>
              
              <div class="text-right shrink-0">
                <div class="mb-4">
                  <span class="text-3xl font-black text-primary">{{ space.pricePerHour | appCurrency }}</span>
                  <span class="text-gray-400 text-xs block font-bold uppercase tracking-widest mt-1">{{ 'PRICING.PER_HOUR' | translate }}</span>
                </div>
                
                <div class="flex gap-2">
                  <button [routerLink]="['/booking/new', space.id]" 
                        class="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-primary transition-all text-sm group-hover:scale-105 active:scale-95 shadow-lg shadow-gray-200">
                    {{ 'CATALOGUE.RESERVE' | translate }}
                  </button>
                  <button [routerLink]="['/admin/spaces/edit', space.id]" [queryParams]="{centerId: center()?.centerId}"
                          class="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 hover:text-gray-900 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Review Component -->
            <div class="px-8 pb-8">
              <app-review-list [spaceId]="space.id"></app-review-list>
            </div>
          </div>
        </div>

        <div *ngIf="spaces().length === 0" class="text-center py-20 bg-gray-50 rounded-3xl">
          <p class="text-gray-500 text-lg font-bold">{{ 'CATALOGUE.NO_SPACES' | translate }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .type-office { color: #6366f1; }
    .type-meeting { color: #f59e0b; }
    .type-desk { color: #10b981; }
    .type-training { color: #8b5cf6; }
  `]
})
export class SpaceListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private catalogueService = inject(CatalogueService);
  private seo = inject(SeoService);

  center = signal<Center | null>(null);
  spaces = signal<Space[]>([]);

  ngOnInit(): void {
    const centerId = Number(this.route.snapshot.paramMap.get('id'));
    if (centerId) {
      this.catalogueService.getCenterById(centerId).subscribe(c => {
        this.center.set(c);
        if (c) {
          this.seo.setMeta(c.name, c.description || 'Explore our available co-working spaces.');
        }
      });
      this.catalogueService.getSpacesByCenter(centerId).subscribe(s => this.spaces.set(s));
    }
  }

  getTypeClass(type: SpaceType): string {
    switch (type) {
      case SpaceType.PRIVATE_OFFICE: return 'type-office';
      case SpaceType.CONFERENCE_ROOM: return 'type-meeting';
      case SpaceType.OPEN_SPACE: return 'type-desk';
      case SpaceType.TRAINING_ROOM: return 'type-training';
      default: return '';
    }
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminService, SpaceRequest } from '../../../../core/services/admin.service';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { Space, SpaceType } from '../../../../core/models/catalogue.models';

@Component({
  selector: 'app-space-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div class="max-w-4xl mx-auto">
        <div class="mb-8 flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-black text-gray-900 font-tight">{{ 'ADMIN.EDIT_SPACE' | translate }}</h1>
            <p class="text-gray-500">{{ spaceId ? 'Updating existing space' : 'Creating new space' }}</p>
          </div>
          <button (click)="save()" [disabled]="form.invalid || loading()"
                  class="px-8 py-3 bg-primary text-white font-black rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-100 disabled:opacity-50">
            {{ 'ADMIN.SAVE_SUCCESS' | translate }}
          </button>
        </div>

        <form [formGroup]="form" class="space-y-8">
          <!-- Basic Info Section -->
          <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 class="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span class="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm">1</span>
              {{ 'ADMIN.SECTION_INFO' | translate }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-black uppercase tracking-widest text-gray-400">{{ 'AUTH.FULL_NAME' | translate }}</label>
                <input formControlName="name" type="text" class="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-primary focus:border-primary font-medium">
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black uppercase tracking-widest text-gray-400">Type</label>
                <select formControlName="type" class="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-primary focus:border-primary font-medium">
                  <option *ngFor="let type of spaceTypes" [value]="type">{{ type }}</option>
                </select>
              </div>
              <div class="md:col-span-2 space-y-2">
                <label class="text-xs font-black uppercase tracking-widest text-gray-400">Description</label>
                <textarea formControlName="description" rows="4" class="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-primary focus:border-primary font-medium"></textarea>
              </div>
            </div>
          </div>

          <!-- Pricing & Capacity Section -->
          <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 class="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span class="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm">2</span>
              {{ 'ADMIN.SECTION_PRICING' | translate }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-black uppercase tracking-widest text-gray-400">Capacity</label>
                <input formControlName="capacity" type="number" class="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-primary focus:border-primary font-medium">
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black uppercase tracking-widest text-gray-400">Price/Hour (MAD)</label>
                <input formControlName="pricePerHour" type="number" class="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-primary focus:border-primary font-medium">
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black uppercase tracking-widest text-gray-400">Price/Day (MAD)</label>
                <input formControlName="pricePerDay" type="number" class="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-primary focus:border-primary font-medium">
              </div>
            </div>
          </div>

          <!-- Gallery Management -->
          <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-black text-gray-900 flex items-center gap-2">
                <span class="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm">3</span>
                {{ 'ADMIN.MANAGE_GALLERY' | translate }}
              </h2>
              <button type="button" (click)="addPhotoUrl()" class="text-primary font-black text-sm">+ Add URL</button>
            </div>
            
            <div formArrayName="photos" class="space-y-4">
              <div *ngFor="let photo of photos.controls; let i=index" class="flex gap-4">
                <input [formControlName]="i" placeholder="Image URL" class="flex-grow px-4 py-3 rounded-xl border border-gray-100 focus:ring-primary focus:border-primary text-sm font-medium">
                <button (click)="removePhoto(i)" class="text-red-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
            
            <div *ngIf="photos.length === 0" class="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
              <p class="text-gray-400 text-sm">{{ 'ADMIN.UPLOAD_HINT' | translate }}</p>
            </div>
          </div>

          <!-- Amenities Management -->
          <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 class="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span class="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm">4</span>
              {{ 'ADMIN.MANAGE_AMENITIES' | translate }}
            </h2>
            <div class="flex flex-wrap gap-4">
              <label *ngFor="let am of availableAmenities" class="relative flex items-center group cursor-pointer">
                <input type="checkbox" [checked]="hasAmenity(am)" (change)="toggleAmenity(am)" class="peer sr-only">
                <div class="px-6 py-3 rounded-xl border-2 border-gray-100 peer-checked:border-primary peer-checked:bg-teal-50 peer-checked:text-primary transition-all font-bold text-sm text-gray-500">
                  {{ am }}
                </div>
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AdminSpaceEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminService);
  private catalogueService = inject(CatalogueService);

  spaceId: number | null = null;
  centerId: number | null = null;
  loading = signal(false);

  spaceTypes = Object.values(SpaceType);
  availableAmenities = ['High-Speed Wi-Fi', 'Technical Support', 'Coffee & Tea', 'Printing Services', 'Smart TV', 'Whiteboard', 'Air Conditioning', 'Podcast Gear'];

  form = this.fb.group({
    name: ['', Validators.required],
    type: [SpaceType.OPEN_SPACE, Validators.required],
    description: ['', Validators.required],
    capacity: [1, [Validators.required, Validators.min(1)]],
    pricePerHour: [0, [Validators.required, Validators.min(0)]],
    pricePerDay: [0],
    photos: this.fb.array([]),
    amenities: this.fb.array([])
  });

  get photos() { return this.form.get('photos') as FormArray; }
  get amenities() { return this.form.get('amenities') as FormArray; }

  ngOnInit() {
    this.spaceId = Number(this.route.snapshot.paramMap.get('spaceId'));
    this.centerId = Number(this.route.snapshot.queryParamMap.get('centerId'));

    if (this.spaceId) {
      this.loadSpace(this.spaceId);
    }
  }

  loadSpace(id: number) {
    this.loading.set(true);
    this.catalogueService.getSpaceById(id).subscribe(space => {
      this.form.patchValue({
        name: space.name,
        type: space.type,
        description: space.description,
        capacity: space.capacity,
        pricePerHour: space.pricePerHour,
        pricePerDay: space.pricePerDay
      });

      // Load photos
      this.photos.clear();
      space.photos.forEach(p => this.photos.push(this.fb.control(p)));

      // Load amenities
      this.amenities.clear();
      space.amenities.forEach(a => this.amenities.push(this.fb.control(a)));
      
      this.loading.set(false);
    });
  }

  addPhotoUrl() {
    this.photos.push(this.fb.control(''));
  }

  removePhoto(index: number) {
    this.photos.removeAt(index);
  }

  hasAmenity(name: string): boolean {
    return this.amenities.value.includes(name);
  }

  toggleAmenity(name: string) {
    const index = this.amenities.value.indexOf(name);
    if (index > -1) {
      this.amenities.removeAt(index);
    } else {
      this.amenities.push(this.fb.control(name));
    }
  }

  save() {
    if (this.form.invalid) return;

    const request: SpaceRequest = {
      ...this.form.value as SpaceRequest,
      centerId: this.centerId || 0 // Should ideally be set from context
    };

    this.loading.set(true);
    if (this.spaceId) {
      this.adminService.updateSpace(this.spaceId, request).subscribe(() => {
        this.loading.set(false);
        this.router.navigate(['/centers', this.centerId]);
      });
    } else {
      this.adminService.createSpace(request).subscribe(() => {
        this.loading.set(false);
        this.router.navigate(['/centers', this.centerId]);
      });
    }
  }
}

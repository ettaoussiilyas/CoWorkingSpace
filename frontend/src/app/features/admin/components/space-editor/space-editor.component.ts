import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AdminService, SpaceRequest } from '../../../../core/services/admin.service';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { SpaceType } from '../../../../core/models/catalogue.models';

const TYPE_LABELS: Record<string, string> = {
  PRIVATE_OFFICE: '🏢 Private Office',
  CONFERENCE_ROOM: '🎯 Conference Room',
  OPEN_SPACE: '🌐 Open Space',
  TRAINING_ROOM: '🎓 Training Room',
};

const AMENITY_ICONS: Record<string, string> = {
  'High-Speed Wi-Fi': '📶',
  'Technical Support': '🛠',
  'Coffee & Tea': '☕',
  'Printing Services': '🖨',
  'Smart TV': '📺',
  'Whiteboard': '📋',
  'Air Conditioning': '❄️',
  'Podcast Gear': '🎙',
};

@Component({
  selector: 'app-space-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="page-header">
        <div class="header-inner">
          <div>
            <a routerLink="/admin" class="back-link">← Back to Dashboard</a>
            <h1>{{ spaceId ? 'Edit' : 'New' }} <span>Space</span></h1>
            <p>{{ spaceId ? 'Update space details and photos' : 'Add a new space to this coworking center' }}</p>
          </div>
          <button (click)="save()" [disabled]="form.invalid || saving()" class="btn-save">
            <span *ngIf="!saving()">{{ spaceId ? '💾 Save Changes' : '🚀 Create Space' }}</span>
            <span *ngIf="saving()" class="spin-wrap"><span class="spinner"></span> Saving...</span>
          </button>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div *ngIf="loadingSpace()" class="container skeleton-wrap">
        <div class="skeleton" style="height:200px"></div>
        <div class="skeleton" style="height:160px"></div>
        <div class="skeleton" style="height:280px"></div>
      </div>

      <div class="container content" *ngIf="!loadingSpace()">
        <form [formGroup]="form">

          <!-- ROW 1: Info + Pricing side by side -->
          <div class="two-col">

            <!-- Section 1: Basic Info -->
            <div class="card">
              <div class="card-title"><span class="step">1</span> Basic Information</div>

              <div class="field">
                <label>Space Name <span class="req">*</span></label>
                <input formControlName="name" type="text" placeholder="e.g. Executive Suite A" />
                <span *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="err">Name is required</span>
              </div>

              <div class="field">
                <label>Type <span class="req">*</span></label>
                <div class="type-grid">
                  <button type="button" *ngFor="let t of spaceTypes"
                    class="type-btn" [class.active]="form.get('type')?.value === t"
                    (click)="form.get('type')?.setValue(t)">
                    {{ typeLabels[t] }}
                  </button>
                </div>
              </div>

              <div class="field">
                <label>Description <span class="req">*</span></label>
                <textarea formControlName="description" rows="4"
                  placeholder="Describe the space, its atmosphere and what makes it special..."></textarea>
                <div class="char-count" [class.warn]="(form.get('description')?.value?.length || 0) > 400">
                  {{ form.get('description')?.value?.length || 0 }} / 500
                </div>
              </div>
            </div>

            <!-- Section 2: Pricing & Capacity -->
            <div class="card">
              <div class="card-title"><span class="step">2</span> Pricing & Capacity</div>

              <div class="field">
                <label>Capacity (people) <span class="req">*</span></label>
                <div class="number-input">
                  <button type="button" (click)="decrement('capacity')">−</button>
                  <input formControlName="capacity" type="number" min="1" />
                  <button type="button" (click)="increment('capacity')">+</button>
                </div>
              </div>

              <div class="field">
                <label>Price per Hour (MAD) <span class="req">*</span></label>
                <div class="price-input">
                  <span class="currency">DH</span>
                  <input formControlName="pricePerHour" type="number" min="0" placeholder="0" />
                  <span class="unit">/ hr</span>
                </div>
              </div>

              <div class="field">
                <label>Price per Day (MAD) <span class="optional">optional</span></label>
                <div class="price-input">
                  <span class="currency">DH</span>
                  <input formControlName="pricePerDay" type="number" min="0" placeholder="0" />
                  <span class="unit">/ day</span>
                </div>
              </div>

              <!-- Live price preview -->
              <div class="price-preview" *ngIf="(form.get('pricePerHour')?.value || 0) > 0">
                <div class="price-preview-row">
                  <span>1 hour</span>
                  <strong>{{ form.get('pricePerHour')?.value }} DH</strong>
                </div>
                <div class="price-preview-row" *ngIf="(form.get('pricePerDay')?.value || 0) > 0">
                  <span>Full day</span>
                  <strong>{{ form.get('pricePerDay')?.value }} DH</strong>
                </div>
                <div class="price-preview-row">
                  <span>8 hours</span>
                  <strong>{{ (form.get('pricePerHour')?.value || 0) * 8 }} DH</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Photos -->
          <div class="card">
            <div class="card-title"><span class="step">3</span> Manage Photos <span class="badge-count">{{ photos.length }}</span></div>

            <!-- URL input -->
            <div class="url-input-row">
              <input #urlInput type="url" placeholder="Paste image URL (https://...)" class="url-field" />
              <button type="button" class="btn-add-url" (click)="addPhotoUrl(urlInput)">Add URL</button>
            </div>

            <!-- Upload zone -->
            <div class="upload-zone"
              [class.drag-over]="isDragging()"
              (dragover)="onDragOver($event)"
              (dragleave)="isDragging.set(false)"
              (drop)="onDrop($event)"
              (click)="fileInput.click()">
              <div *ngIf="!uploading()" class="upload-inner">
                <div class="upload-icon">☁️</div>
                <p class="upload-title">Drag &amp; drop or <span>click to upload</span> photos</p>
                <p class="upload-hint">JPG, PNG, WEBP — uploaded to Cloudinary automatically</p>
              </div>
              <div *ngIf="uploading()" class="upload-inner">
                <div class="upload-spinner"></div>
                <p class="upload-title">Uploading to Cloudinary...</p>
                <p class="upload-hint">{{ uploadProgress() }}</p>
              </div>
            </div>
            <input #fileInput type="file" accept="image/*" multiple class="hidden-input" (change)="onFilesSelected($event)" />

            <!-- Photo gallery grid -->
            <div class="photo-grid" *ngIf="photos.length > 0">
              <div class="photo-item" *ngFor="let ctrl of photos.controls; let i = index">
                <img [src]="ctrl.value" [alt]="'Photo ' + (i+1)" (error)="onPhotoError($event)" />
                <div class="photo-overlay">
                  <span class="photo-badge" *ngIf="i === 0">Cover</span>
                  <button type="button" class="photo-remove" (click)="removePhoto(i)">✕</button>
                </div>
              </div>
            </div>

            <div *ngIf="photos.length === 0" class="no-photos">
              <p>No photos yet — upload at least one cover photo</p>
            </div>
          </div>

          <!-- Section 4: Manage Amenities -->
          <div class="card">
            <div class="card-title">
              <span class="step">4</span> Manage Amenities
              <span class="badge-count">{{ amenities.length }} selected</span>
            </div>
            <div class="amenities-grid">
              <button type="button" *ngFor="let am of availableAmenities"
                class="amenity-btn" [class.active]="hasAmenity(am)"
                (click)="toggleAmenity(am)">
                <span class="amenity-icon">{{ amenityIcons[am] }}</span>
                <span>{{ am }}</span>
                <span class="amenity-check" *ngIf="hasAmenity(am)">✓</span>
              </button>
            </div>
          </div>

        </form>
      </div>

      <!-- Toast -->
      <div *ngIf="successMsg()" class="toast success">✅ {{ successMsg() }}</div>
      <div *ngIf="errorMsg()" class="toast error">❌ {{ errorMsg() }}</div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .page { min-height: 100vh; background: #f1f5f9; font-family: 'Inter', sans-serif; }

    .page-header {
      background: linear-gradient(135deg, #0f172a, #1e293b);
      padding: 28px 0;
    }
    .header-inner {
      max-width: 1100px; margin: 0 auto; padding: 0 24px;
      display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap;
    }
    .back-link { color: #64748b; font-size: 0.82rem; font-weight: 600; text-decoration: none; display: inline-block; margin-bottom: 8px; &:hover { color: #14b8a6; } }
    h1 { font-size: 1.8rem; font-weight: 900; color: white; margin: 0 0 4px; span { color: #14b8a6; } }
    .page-header p { color: #64748b; font-size: 0.85rem; margin: 0; }

    .btn-save {
      background: linear-gradient(135deg, #14b8a6, #0d9488); color: white; border: none;
      padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 0.95rem;
      cursor: pointer; white-space: nowrap; box-shadow: 0 4px 20px rgba(20,184,166,0.35);
      transition: all 0.2s; flex-shrink: 0;
      &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(20,184,166,0.45); }
      &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    }
    .spin-wrap { display: flex; align-items: center; gap: 8px; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .content { padding: 32px 24px 80px; }

    /* Skeleton */
    .skeleton-wrap { padding: 32px 24px; display: flex; flex-direction: column; gap: 20px; }
    .skeleton { background: #e2e8f0; border-radius: 20px; animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

    /* Layout */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

    /* Card */
    .card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; padding: 28px; margin-bottom: 20px; }
    .card-title {
      font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
      color: #94a3b8; margin-bottom: 24px; display: flex; align-items: center; gap: 8px;
    }
    .step { width: 22px; height: 22px; background: #0f172a; color: white; border-radius: 6px; font-size: 0.7rem; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .badge-count { background: #f0fdfa; color: #0d9488; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; margin-left: auto; }

    /* Fields */
    .field { margin-bottom: 20px; }
    .field label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
    .req { color: #ef4444; }
    .optional { color: #94a3b8; font-weight: 500; text-transform: none; letter-spacing: 0; font-size: 0.72rem; }
    .field input, .field textarea, .field select {
      width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
      font-size: 0.88rem; font-family: inherit; outline: none; color: #1e293b; transition: border-color 0.2s;
      &:focus { border-color: #14b8a6; box-shadow: 0 0 0 3px rgba(20,184,166,0.1); }
    }
    .field textarea { resize: vertical; }
    .char-count { font-size: 0.72rem; color: #94a3b8; text-align: right; margin-top: 4px; &.warn { color: #f59e0b; } }
    .err { font-size: 0.72rem; color: #ef4444; margin-top: 4px; display: block; }

    /* Type grid */
    .type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .type-btn {
      padding: 10px 12px; border-radius: 10px; border: 1.5px solid #e2e8f0;
      background: white; color: #64748b; font-size: 0.82rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s; text-align: left;
      &:hover { border-color: #14b8a6; color: #14b8a6; }
      &.active { background: #0f172a; border-color: #0f172a; color: white; }
    }

    /* Number input */
    .number-input { display: flex; align-items: center; border: 1.5px solid #e2e8f0; border-radius: 10px; overflow: hidden;
      button { width: 44px; height: 44px; border: none; background: #f8fafc; color: #475569; font-size: 1.2rem; font-weight: 700; cursor: pointer; flex-shrink: 0; &:hover { background: #e2e8f0; } }
      input { flex: 1; border: none; text-align: center; font-size: 1rem; font-weight: 700; color: #1e293b; outline: none; padding: 0; }
    }

    /* Price input */
    .price-input { display: flex; align-items: center; border: 1.5px solid #e2e8f0; border-radius: 10px; overflow: hidden;
      &:focus-within { border-color: #14b8a6; box-shadow: 0 0 0 3px rgba(20,184,166,0.1); }
      .currency { padding: 0 12px; background: #f8fafc; color: #94a3b8; font-size: 0.82rem; font-weight: 700; border-right: 1px solid #e2e8f0; height: 44px; display: flex; align-items: center; }
      input { flex: 1; border: none; padding: 11px 12px; font-size: 0.95rem; font-weight: 700; color: #1e293b; outline: none; }
      .unit { padding: 0 12px; color: #94a3b8; font-size: 0.78rem; font-weight: 600; border-left: 1px solid #e2e8f0; height: 44px; display: flex; align-items: center; }
    }

    /* Price preview */
    .price-preview { background: #f8fafc; border-radius: 12px; padding: 14px 16px; margin-top: 4px; }
    .price-preview-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #64748b; padding: 3px 0;
      strong { color: #14b8a6; font-weight: 800; }
    }

    /* URL input */
    .url-input-row { display: flex; gap: 10px; margin-bottom: 16px; }
    .url-field {
      flex: 1; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
      font-size: 0.88rem; outline: none; color: #1e293b; transition: border-color 0.2s;
      &:focus { border-color: #14b8a6; box-shadow: 0 0 0 3px rgba(20,184,166,0.1); }
    }
    .btn-add-url {
      padding: 11px 20px; background: #0f172a; color: white; border: none;
      border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer;
      white-space: nowrap; transition: background 0.2s;
      &:hover { background: #14b8a6; }
    }

    /* Upload zone */
    .upload-zone {
      border: 2px dashed #e2e8f0; border-radius: 16px; padding: 40px 24px;
      text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 20px;
      &:hover, &.drag-over { border-color: #14b8a6; background: #f0fdfa; }
    }
    .upload-inner { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .upload-icon { font-size: 2.5rem; }
    .upload-title { font-size: 0.9rem; font-weight: 700; color: #475569; margin: 0; span { color: #14b8a6; text-decoration: underline; } }
    .upload-hint { font-size: 0.75rem; color: #94a3b8; margin: 0; }
    .upload-spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #14b8a6; border-radius: 50%; animation: spin 0.7s linear infinite; }
    .hidden-input { display: none; }

    /* Photo grid */
    .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 8px; }
    .photo-item { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 4/3;
      img { width: 100%; height: 100%; object-fit: cover; display: block; }
    }
    .photo-overlay { position: absolute; inset: 0; background: rgba(15,23,42,0); transition: background 0.2s; display: flex; align-items: flex-start; justify-content: space-between; padding: 8px; }
    .photo-item:hover .photo-overlay { background: rgba(15,23,42,0.35); }
    .photo-badge { background: #14b8a6; color: white; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 100px; text-transform: uppercase; }
    .photo-remove { background: rgba(239,68,68,0.9); color: white; border: none; width: 24px; height: 24px; border-radius: 50%; font-size: 0.7rem; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
    .photo-item:hover .photo-remove { opacity: 1; }
    .no-photos { text-align: center; padding: 20px; color: #94a3b8; font-size: 0.85rem; }

    /* Amenities */
    .amenities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
    .amenity-btn {
      display: flex; align-items: center; gap: 10px; padding: 12px 16px;
      border-radius: 12px; border: 1.5px solid #e2e8f0; background: white;
      color: #64748b; font-size: 0.85rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s; text-align: left; position: relative;
      &:hover { border-color: #14b8a6; color: #14b8a6; background: #f0fdfa; }
      &.active { border-color: #14b8a6; background: #f0fdfa; color: #0d9488; }
    }
    .amenity-icon { font-size: 1.1rem; flex-shrink: 0; }
    .amenity-check { margin-left: auto; color: #14b8a6; font-weight: 900; font-size: 0.85rem; }

    /* Toast */
    .toast { position: fixed; bottom: 28px; right: 28px; padding: 14px 22px; border-radius: 12px; font-weight: 700; font-size: 0.88rem; box-shadow: 0 8px 32px rgba(0,0,0,0.12); z-index: 9999; animation: slideUp 0.3s ease;
      &.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
      &.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    @media (max-width: 900px) {
      .two-col { grid-template-columns: 1fr; }
      .header-inner { flex-direction: column; align-items: flex-start; }
      .btn-save { width: 100%; justify-content: center; }
    }
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

  saving = signal(false);
  loadingSpace = signal(false);
  uploading = signal(false);
  isDragging = signal(false);
  uploadProgress = signal('');
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  spaceTypes = Object.values(SpaceType);
  typeLabels = TYPE_LABELS;
  amenityIcons = AMENITY_ICONS;
  availableAmenities = Object.keys(AMENITY_ICONS);

  form = this.fb.group({
    name: ['', Validators.required],
    type: [SpaceType.OPEN_SPACE, Validators.required],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    capacity: [1, [Validators.required, Validators.min(1)]],
    pricePerHour: [0, [Validators.required, Validators.min(0)]],
    pricePerDay: [0],
    photos: this.fb.array([]),
    amenities: this.fb.array([])
  });

  get photos() { return this.form.get('photos') as FormArray; }
  get amenities() { return this.form.get('amenities') as FormArray; }

  ngOnInit() {
    const rawId = this.route.snapshot.paramMap.get('spaceId');
    this.spaceId = rawId ? Number(rawId) : null;
    this.centerId = Number(this.route.snapshot.queryParamMap.get('centerId')) || null;
    if (this.spaceId) this.loadSpace(this.spaceId);
  }

  loadSpace(id: number) {
    this.loadingSpace.set(true);
    this.catalogueService.getSpaceById(id).subscribe({
      next: space => {
        this.form.patchValue({
          name: space.name, type: space.type, description: space.description,
          capacity: space.capacity, pricePerHour: space.pricePerHour, pricePerDay: space.pricePerDay
        });
        this.photos.clear();
        space.photos.forEach(p => this.photos.push(this.fb.control(p)));
        this.amenities.clear();
        space.amenities.forEach(a => this.amenities.push(this.fb.control(a)));
        this.loadingSpace.set(false);
      },
      error: () => this.loadingSpace.set(false)
    });
  }

  // ── Upload ──────────────────────────────────────────────
  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging.set(true); }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length) this.uploadFiles(files);
  }

  onFilesSelected(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    if (files.length) this.uploadFiles(files);
    (e.target as HTMLInputElement).value = '';
  }

  private uploadFiles(files: File[]) {
    this.uploading.set(true);
    let done = 0;
    this.uploadProgress.set(`0 / ${files.length} uploaded`);
    files.forEach(file => {
      this.adminService.uploadImage(file).subscribe({
        next: url => {
          this.photos.push(this.fb.control(url));
          done++;
          this.uploadProgress.set(`${done} / ${files.length} uploaded`);
          if (done === files.length) this.uploading.set(false);
        },
        error: () => {
          done++;
          this.errorMsg.set('Failed to upload one or more images');
          setTimeout(() => this.errorMsg.set(null), 3000);
          if (done === files.length) this.uploading.set(false);
        }
      });
    });
  }

  removePhoto(i: number) { this.photos.removeAt(i); }
  onPhotoError(e: any) { e.target.src = 'assets/images/spaces/space1.jpg'; }

  addPhotoUrl(input: HTMLInputElement) {
    const url = input.value.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      this.photos.push(this.fb.control(url));
      input.value = '';
    }
  }

  // ── Amenities ───────────────────────────────────────────
  hasAmenity(name: string) { return this.amenities.value.includes(name); }
  toggleAmenity(name: string) {
    const idx = this.amenities.value.indexOf(name);
    idx > -1 ? this.amenities.removeAt(idx) : this.amenities.push(this.fb.control(name));
  }

  // ── Number controls ─────────────────────────────────────
  increment(field: string) {
    const ctrl = this.form.get(field);
    if (ctrl) ctrl.setValue((ctrl.value || 0) + 1);
  }
  decrement(field: string) {
    const ctrl = this.form.get(field);
    if (ctrl && ctrl.value > 1) ctrl.setValue(ctrl.value - 1);
  }

  // ── Save ────────────────────────────────────────────────
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.errorMsg.set(null);

    const request: SpaceRequest = {
      ...(this.form.value as SpaceRequest),
      centerId: this.centerId || 0
    };

    const op = this.spaceId
      ? this.adminService.updateSpace(this.spaceId, request)
      : this.adminService.createSpace(request);

    op.subscribe({
      next: () => {
        this.saving.set(false);
        this.successMsg.set(this.spaceId ? 'Space updated successfully!' : 'Space created successfully!');
        setTimeout(() => this.router.navigate(['/admin'], { queryParams: { tab: 'spaces' } }), 1500);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message || 'Failed to save space. Please try again.');
        setTimeout(() => this.errorMsg.set(null), 4000);
      }
    });
  }
}

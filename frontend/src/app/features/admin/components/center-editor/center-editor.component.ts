import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-center-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="page-header">
        <div class="header-inner">
          <div>
            <a routerLink="/admin" class="back-link">← Back to Dashboard</a>
            <h1>Add New <span>Center</span></h1>
            <p>Create a coworking center and upload its cover photo to Cloudinary</p>
          </div>
          <button (click)="save()" [disabled]="form.invalid || loading() || !imageFile()" class="btn-save">
            <span *ngIf="!loading()">🚀 Publish Center</span>
            <span *ngIf="loading()" class="spinner-wrap"><span class="spinner"></span> Uploading...</span>
          </button>
        </div>
      </div>

      <div class="content">
        <form [formGroup]="form" class="form-grid">

          <!-- LEFT COLUMN -->
          <div class="col-left">

            <!-- Photo Upload -->
            <div class="card">
              <div class="card-label">
                <span class="step">1</span>
                Cover Photo
                <span class="required-badge">Required</span>
              </div>

              <div class="upload-zone"
                   [class.has-image]="previewUrl()"
                   [class.drag-over]="isDragging()"
                   (dragover)="onDragOver($event)"
                   (dragleave)="isDragging.set(false)"
                   (drop)="onDrop($event)"
                   (click)="fileInput.click()">

                <img *ngIf="previewUrl()" [src]="previewUrl()!" class="preview-img" alt="Preview" />

                <div *ngIf="!previewUrl()" class="upload-placeholder">
                  <div class="upload-icon">☁️</div>
                  <p class="upload-title">Drop image here or <span>browse</span></p>
                  <p class="upload-hint">JPG, PNG, WEBP — uploaded to Cloudinary</p>
                </div>

                <div *ngIf="previewUrl()" class="overlay-change">
                  <span>🔄 Change Photo</span>
                </div>
              </div>

              <input #fileInput type="file" accept="image/*" class="hidden-input" (change)="onFileSelected($event)" />

              <div *ngIf="imageFile()" class="file-info">
                <span class="file-name">📎 {{ imageFile()!.name }}</span>
                <span class="file-size">{{ (imageFile()!.size / 1024).toFixed(0) }} KB</span>
                <button type="button" class="remove-file" (click)="removeImage()">✕</button>
              </div>

              <div *ngIf="!imageFile()" class="upload-warning">
                ⚠️ A cover photo is required to create a center
              </div>
            </div>

            <!-- Opening Hours -->
            <div class="card">
              <div class="card-label"><span class="step">4</span> Opening Hours</div>
              <div class="field">
                <label>Schedule</label>
                <input formControlName="openingHours" type="text" placeholder="e.g. Mon–Fri 8:00–20:00" />
                <span class="field-hint">Displayed on the center card</span>
              </div>
            </div>

            <!-- Contact -->
            <div class="card">
              <div class="card-label"><span class="step">5</span> Contact Info</div>
              <div class="field">
                <label>Phone</label>
                <input formControlName="phone" type="tel" placeholder="+212 6XX XXX XXX" />
              </div>
              <div class="field">
                <label>Email</label>
                <input formControlName="email" type="email" placeholder="contact@center.com" />
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN -->
          <div class="col-right">

            <!-- Basic Info -->
            <div class="card">
              <div class="card-label"><span class="step">2</span> Center Details</div>

              <div class="field">
                <label>Center Name <span class="req">*</span></label>
                <input formControlName="name" type="text" placeholder="e.g. SpaceHub Casablanca" />
                <span *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="field-error">Name is required</span>
              </div>

              <div class="field-row">
                <div class="field">
                  <label>City <span class="req">*</span></label>
                  <select formControlName="city">
                    <option value="">Select city...</option>
                    <option *ngFor="let c of cities" [value]="c">{{ c }}</option>
                  </select>
                  <span *ngIf="form.get('city')?.invalid && form.get('city')?.touched" class="field-error">City is required</span>
                </div>
              </div>

              <div class="field">
                <label>Address <span class="req">*</span></label>
                <input formControlName="address" type="text" placeholder="123 Boulevard Mohammed V" />
                <span *ngIf="form.get('address')?.invalid && form.get('address')?.touched" class="field-error">Address is required</span>
              </div>
            </div>

            <!-- Description -->
            <div class="card">
              <div class="card-label"><span class="step">3</span> Description</div>
              <div class="field">
                <label>About this center <span class="req">*</span></label>
                <textarea formControlName="description" rows="5"
                  placeholder="Describe the atmosphere, facilities, and what makes this center unique..."></textarea>
                <div class="char-count" [class.warn]="(form.get('description')?.value?.length || 0) > 400">
                  {{ form.get('description')?.value?.length || 0 }} / 500
                </div>
                <span *ngIf="form.get('description')?.invalid && form.get('description')?.touched" class="field-error">Description is required</span>
              </div>
            </div>

            <!-- Preview Card -->
            <div class="card preview-card-wrap">
              <div class="card-label">👁 Live Preview</div>
              <div class="preview-center-card">
                <div class="preview-img-wrap">
                  <img *ngIf="previewUrl()" [src]="previewUrl()!" alt="preview" />
                  <div *ngIf="!previewUrl()" class="preview-img-placeholder">No image yet</div>
                  <span class="preview-city-tag">{{ form.get('city')?.value || 'City' }}</span>
                </div>
                <div class="preview-body">
                  <h3>{{ form.get('name')?.value || 'Center Name' }}</h3>
                  <p>{{ form.get('address')?.value || 'Address will appear here' }}</p>
                  <div class="preview-footer">
                    <span class="preview-hours">🕐 {{ form.get('openingHours')?.value || 'Opening hours' }}</span>
                    <span class="preview-rating">⭐ New</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </form>

        <!-- Success Toast -->
        <div *ngIf="successMsg()" class="toast success">
          ✅ {{ successMsg() }}
        </div>
        <div *ngIf="errorMsg()" class="toast error">
          ❌ {{ errorMsg() }}
        </div>
      </div>
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
      max-width: 1200px; margin: 0 auto; padding: 0 24px;
      display: flex; justify-content: space-between; align-items: flex-end; gap: 20px;
    }
    .back-link {
      color: #64748b; font-size: 0.82rem; font-weight: 600; text-decoration: none;
      display: inline-block; margin-bottom: 8px;
      &:hover { color: #14b8a6; }
    }
    h1 { font-size: 1.8rem; font-weight: 900; color: white; margin: 0 0 4px;
      span { color: #14b8a6; }
    }
    .page-header p { color: #64748b; font-size: 0.85rem; margin: 0; }

    .btn-save {
      background: linear-gradient(135deg, #14b8a6, #0d9488);
      color: white; border: none; padding: 14px 28px; border-radius: 12px;
      font-weight: 800; font-size: 0.95rem; cursor: pointer; white-space: nowrap;
      box-shadow: 0 4px 20px rgba(20,184,166,0.35); transition: all 0.2s; flex-shrink: 0;
      &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(20,184,166,0.45); }
      &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    }
    .spinner-wrap { display: flex; align-items: center; gap: 8px; }
    .spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .content { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }

    .form-grid { display: grid; grid-template-columns: 380px 1fr; gap: 24px; align-items: start; }

    .card {
      background: white; border-radius: 20px; border: 1px solid #e2e8f0;
      padding: 24px; margin-bottom: 20px;
    }
    .card-label {
      font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
      color: #94a3b8; margin-bottom: 18px; display: flex; align-items: center; gap: 8px;
    }
    .step {
      width: 22px; height: 22px; background: #0f172a; color: white;
      border-radius: 6px; font-size: 0.7rem; font-weight: 900;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .required-badge {
      background: #fef2f2; color: #ef4444; font-size: 0.68rem;
      padding: 2px 8px; border-radius: 100px; margin-left: auto;
    }

    /* Upload Zone */
    .upload-zone {
      border: 2px dashed #e2e8f0; border-radius: 16px; min-height: 220px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
      &:hover, &.drag-over { border-color: #14b8a6; background: #f0fdfa; }
      &.has-image { border-style: solid; border-color: #14b8a6; }
    }
    .upload-placeholder { text-align: center; padding: 20px; }
    .upload-icon { font-size: 2.5rem; margin-bottom: 12px; }
    .upload-title { font-size: 0.9rem; font-weight: 700; color: #475569; margin: 0 0 6px;
      span { color: #14b8a6; text-decoration: underline; }
    }
    .upload-hint { font-size: 0.75rem; color: #94a3b8; margin: 0; }
    .preview-img { width: 100%; height: 220px; object-fit: cover; display: block; }
    .overlay-change {
      position: absolute; inset: 0; background: rgba(15,23,42,0.5);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s; color: white; font-weight: 700; font-size: 0.9rem;
    }
    .upload-zone:hover .overlay-change { opacity: 1; }
    .hidden-input { display: none; }

    .file-info {
      display: flex; align-items: center; gap: 8px; margin-top: 12px;
      background: #f0fdfa; border-radius: 10px; padding: 8px 12px;
    }
    .file-name { font-size: 0.8rem; font-weight: 600; color: #0d9488; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .file-size { font-size: 0.75rem; color: #94a3b8; flex-shrink: 0; }
    .remove-file { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.85rem; padding: 0 4px; flex-shrink: 0; }
    .upload-warning { margin-top: 10px; font-size: 0.78rem; color: #f59e0b; font-weight: 600; }

    /* Fields */
    .field { margin-bottom: 16px; }
    .field-row { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .field label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
    .req { color: #ef4444; }
    .field input, .field select, .field textarea {
      width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
      font-size: 0.88rem; font-family: inherit; outline: none; transition: border-color 0.2s; color: #1e293b;
      &:focus { border-color: #14b8a6; box-shadow: 0 0 0 3px rgba(20,184,166,0.1); }
    }
    .field textarea { resize: vertical; }
    .field-hint { font-size: 0.72rem; color: #94a3b8; margin-top: 4px; display: block; }
    .field-error { font-size: 0.72rem; color: #ef4444; margin-top: 4px; display: block; }
    .char-count { font-size: 0.72rem; color: #94a3b8; text-align: right; margin-top: 4px; &.warn { color: #f59e0b; } }

    /* Preview Card */
    .preview-card-wrap .card-label { margin-bottom: 14px; }
    .preview-center-card {
      border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0;
    }
    .preview-img-wrap { position: relative; height: 140px; background: #f8fafc; }
    .preview-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .preview-img-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 0.82rem; }
    .preview-city-tag {
      position: absolute; top: 10px; left: 10px; background: rgba(15,23,42,0.75);
      color: white; font-size: 0.68rem; font-weight: 700; padding: 3px 10px; border-radius: 100px;
    }
    .preview-body { padding: 14px 16px; }
    .preview-body h3 { font-size: 0.95rem; font-weight: 800; color: #1e293b; margin: 0 0 4px; }
    .preview-body p { font-size: 0.78rem; color: #94a3b8; margin: 0 0 10px; }
    .preview-footer { display: flex; justify-content: space-between; align-items: center; }
    .preview-hours { font-size: 0.72rem; color: #0d9488; font-weight: 600; }
    .preview-rating { font-size: 0.72rem; color: #f59e0b; font-weight: 700; background: #fffbeb; padding: 2px 8px; border-radius: 100px; }

    /* Toast */
    .toast {
      position: fixed; bottom: 28px; right: 28px; padding: 14px 22px;
      border-radius: 12px; font-weight: 700; font-size: 0.88rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12); z-index: 9999; animation: slideUp 0.3s ease;
      &.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
      &.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    @media (max-width: 900px) {
      .form-grid { grid-template-columns: 1fr; }
      .header-inner { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class CenterEditorComponent {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private router = inject(Router);

  loading = signal(false);
  imageFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isDragging = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Kenitra', 'Tétouan'];

  form = this.fb.group({
    name: ['', Validators.required],
    city: ['', Validators.required],
    address: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    phone: [''],
    email: ['', Validators.email],
    openingHours: ['']
  });

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.setImage(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) this.setImage(file);
  }

  private setImage(file: File) {
    this.imageFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imageFile.set(null);
    this.previewUrl.set(null);
  }

  save() {
    if (this.form.invalid || !this.imageFile()) return;
    this.loading.set(true);
    this.errorMsg.set(null);

    const req = this.form.value as any;
    this.adminService.createCenter(req, this.imageFile()!).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('Center created successfully! Redirecting...');
        setTimeout(() => this.router.navigate(['/admin']), 1800);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message || 'Failed to create center. Please try again.');
        setTimeout(() => this.errorMsg.set(null), 4000);
      }
    });
  }
}

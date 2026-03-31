import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { CenterGalleryComponent } from './features/catalogue/components/center-gallery/center-gallery.component';
import { SpaceListComponent } from './features/catalogue/components/space-list/space-list.component';
import { BookingFormComponent } from './features/booking/components/booking-form/booking-form.component';
import { UserBookingsComponent } from './features/booking/components/user-bookings/user-bookings.component';
import { AdminDashboardComponent } from './features/admin/pages/admin-dashboard.component';
import { AdminSpaceEditorComponent } from './features/admin/components/space-editor/space-editor.component';
import { CenterEditorComponent } from './features/admin/components/center-editor/center-editor.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { userGuard } from './core/guards/user.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'centers', component: CenterGalleryComponent },
  { path: 'centers/:id', component: SpaceListComponent },
  { path: 'booking/new/:spaceId', component: BookingFormComponent, canActivate: [userGuard] },
  { path: 'my-bookings', component: UserBookingsComponent, canActivate: [userGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/spaces/new', component: AdminSpaceEditorComponent, canActivate: [adminGuard] },
  { path: 'admin/spaces/edit/:spaceId', component: AdminSpaceEditorComponent, canActivate: [adminGuard] },
  { path: 'admin/centers/new', component: CenterEditorComponent, canActivate: [adminGuard] },
  { path: 'home', redirectTo: '', pathMatch: 'full' }
];

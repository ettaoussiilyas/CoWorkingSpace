import { NgModule } from '@angular/core';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
// no icons detected automatically — add imports from '@ng-icons/lucide' below and provide them in provideIcons
import * as lucideIcons from '@ng-icons/lucide';

@NgModule({
  imports: [NgIconsModule],
  providers: [
    // Example: provideIcons({ lucideHome, lucideUser });
    // Add your icons here
    provideIcons({ ...lucideIcons }),
  ],
  exports: [NgIconsModule],
})
export class IconsModule {}

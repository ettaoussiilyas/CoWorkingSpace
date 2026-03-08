import { NgModule } from '@angular/core';
import { provideIcons, NgIconsModule } from '@ng-icons/core';
import * as lucideIcons from '@ng-icons/lucide';

// Re-export for migration: components can import { NgIconsModule, NgIconComponent } from here
export { NgIconsModule } from '@ng-icons/core';

@NgModule({
  imports: [NgIconsModule],
  providers: [provideIcons(lucideIcons)],
  exports: [NgIconsModule]
})
export class LucideAngularModule {
  static pick(_icons: any) {
    // keep compatibility with previous usage; icons are provided globally via provideIcons
    return LucideAngularModule;
  }
}


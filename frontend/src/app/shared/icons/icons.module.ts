import { NgModule } from '@angular/core';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  lucideMonitor, lucideLock, lucideUsers, lucideCoffee, lucideMic,
  lucideBookOpen, lucideBuilding2, lucideRocket, lucideMapPin,
  lucidePhone, lucideMail, lucideSearch, lucideArrowRight,
  lucideClock, lucideMenu, lucideX, lucideTwitter, lucideLinkedin,
  lucideInstagram, lucideStar, lucideCalendar, lucideUser
} from '@ng-icons/lucide';

@NgModule({
  imports: [NgIconsModule],
  providers: [
    provideIcons({
      lucideMonitor, lucideLock, lucideUsers, lucideCoffee, lucideMic,
      lucideBookOpen, lucideBuilding2, lucideRocket, lucideMapPin,
      lucidePhone, lucideMail, lucideSearch, lucideArrowRight,
      lucideClock, lucideMenu, lucideX, lucideTwitter, lucideLinkedin,
      lucideInstagram, lucideStar, lucideCalendar, lucideUser
    }),
  ],
  exports: [NgIconsModule],
})
export class IconsModule {}

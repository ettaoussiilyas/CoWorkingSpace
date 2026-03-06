import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private translate = inject(TranslateService);
  
  // Current language signal
  currentLang = signal<string>(localStorage.getItem('lang') || 'en');

  constructor() {
    this.translate.addLangs(['en', 'fr', 'de']);
    this.translate.setDefaultLang('en');
    this.use(this.currentLang());
  }

  use(lang: string) {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem('lang', lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  }
}

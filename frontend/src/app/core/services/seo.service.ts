import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);

  setMeta(title: string, description: string, image?: string) {
    this.title.setTitle(`${title} | AIHub Co-Working`);
    
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    
    if (image) {
      this.meta.updateTag({ property: 'og:image', content: image });
    }

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }
}

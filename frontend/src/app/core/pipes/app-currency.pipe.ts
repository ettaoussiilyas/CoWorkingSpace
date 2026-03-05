import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../services/currency.service';

@Pipe({
  name: 'appCurrency',
  standalone: true,
  pure: false // Necessary because currentCurrency is a signal
})
export class AppCurrencyPipe implements PipeTransform {
  private currencyService = inject(CurrencyService);

  transform(value: number | undefined): string {
    if (value === undefined || value === null) return '';
    
    const converted = this.currencyService.convert(value);
    const currency = this.currencyService.currentCurrency();
    
    if (currency === 'MAD') {
      return `${converted.toFixed(0)} DH`;
    } else {
      return `$${converted.toFixed(2)}`;
    }
  }
}

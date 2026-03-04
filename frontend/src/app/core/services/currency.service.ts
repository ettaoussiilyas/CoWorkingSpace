import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export type Currency = 'MAD' | 'USD';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private http = inject(HttpClient);
  
  // Current currency signal
  currentCurrency = signal<Currency>('MAD');
  // Exchange rate: 1 USD = 10 MAD
  private readonly rate = 10;

  constructor() {
    this.detectCurrency();
  }

  detectCurrency() {
    const saved = localStorage.getItem('currency') as Currency;
    if (saved) {
      this.currentCurrency.set(saved);
      return;
    }

    // Free geolocation API
    this.http.get<any>('https://ipapi.co/json/').subscribe({
      next: (res) => {
        const currency = res.country_code === 'MA' ? 'MAD' : 'USD';
        this.setCurrency(currency);
      },
      error: () => this.setCurrency('USD') // Default to USD on error
    });
  }

  setCurrency(currency: Currency) {
    this.currentCurrency.set(currency);
    localStorage.setItem('currency', currency);
  }

  convert(amount: number): number {
    if (this.currentCurrency() === 'USD') {
      return amount / this.rate;
    }
    return amount;
  }
}

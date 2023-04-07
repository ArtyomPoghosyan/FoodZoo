import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppLocalStorageService {

  constructor() { }

  clear(): void {
    localStorage.clear();
  }

  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  key(index: number): string | null {
    return localStorage.key(index);
  }

  removeItem(key: string): void {
    return localStorage.removeItem(key);
  }

  setItem(key: string, value: string): void {
    return localStorage.setItem(key, value);
  }

}

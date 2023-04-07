import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppSessionStorageService {

  constructor() { }
  
  clear(): void {
    sessionStorage.clear();
  }

  getItem(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  key(index: number): string | null {
    return sessionStorage.key(index);
  }

  removeItem(key: string): void {
    return sessionStorage.removeItem(key);
  }

  setItem(key: string, value: string): void {
    return sessionStorage.setItem(key, value);
  }

}

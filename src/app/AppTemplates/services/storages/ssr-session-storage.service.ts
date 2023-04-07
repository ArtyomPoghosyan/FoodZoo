import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SsrSessionStorageService {

  storage: {[key:string]:string} = {};
  
  constructor() { }

  clear(): void {
    this.storage = {};
  }

  getItem(key: string): string | null {
    return this.storage[key];
  }

  removeItem(key: string): void {
    this.storage[key] = undefined;
  }

  setItem(key: string, value: string): void {
    this.storage[key] = value;
  }
  
}

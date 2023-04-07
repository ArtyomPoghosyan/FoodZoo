import { Injectable } from '@angular/core';

declare const ym;

@Injectable({
  providedIn: 'root'
})
export class YandexMetricaHelperService {

  constructor() { }

  cartAddAction(){
    ym(90837098,'reachGoal','cart'); return true;
  }

  cartOrderAction(){
    ym(90837098,'reachGoal','zakaz'); return true;
  }

}

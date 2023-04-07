import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppSessionStorageService } from '../../../../AppTemplates/services/storages/app-session-storage.service';
import { AppLocalStorageService } from '../../../../AppTemplates/services/storages/app-local-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-complete',
  templateUrl: './order-complete.component.html',
  styleUrls: ['./order-complete.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrderCompleteComponent implements OnInit {

  orderID:number = 0;

  constructor(
    private localStorage: AppLocalStorageService,
    private sessionStorage: AppSessionStorageService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if(this.localStorage.getItem('orderID')){
      this.orderID = +this.localStorage.getItem('orderID')
    } else {
      this.router.navigate(['/catalog'])
    }
    this.clearCart();
  }

  clearCart(){
    this.sessionStorage.setItem('totalAmount', `${0}`);
    let b = JSON.parse(this.localStorage.getItem('UData'));
    b.profile.cartAmount = 0;
    this.localStorage.setItem('UData', JSON.stringify(b));
  }

  ngOnDestroy(){
    this.localStorage.removeItem('orderID');
  }

}

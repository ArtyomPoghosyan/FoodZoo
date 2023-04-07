import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-cart-sidebar',
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CartSidebarComponent implements OnInit {

  @Input() orderSum: number = 0;
  @Input() minOrderSum: number = 0;
  @Input() productCount: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  returnNotAllowPrice(){
    return this.minOrderSum - this.orderSum;
  }

  returnPercent(){
    if((this.orderSum / (this.minOrderSum / 100)) <= 100){
      return this.orderSum / (this.minOrderSum / 100)
    } else {
      return 100
    }
  }

}

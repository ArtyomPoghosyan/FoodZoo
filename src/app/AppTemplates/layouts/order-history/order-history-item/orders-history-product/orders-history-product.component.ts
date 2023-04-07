import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ordersHystoryProduct } from '../../../../../AppTemplates/services/Portal/closed-api.service';

@Component({
  selector: 'app-orders-history-product',
  templateUrl: './orders-history-product.component.html',
  styleUrls: ['./orders-history-product.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrdersHistoryProductComponent implements OnInit {

  @Input() product: ordersHystoryProduct|null;
  @Input() checkedItems: [{id:number, quantity:number}]|any = [];
  @Output() toggleChecked: EventEmitter<{id:number, quantity:number}> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {}

  returnCheked() : boolean{
    return this.checkedItems.filter(item => item.id == this.product.product.id).length > 0;
  }

  returnImage(product:ordersHystoryProduct) : string {
    if(window && window.innerWidth){
      if(window.innerWidth > 420) {
        if(product.product.censoredImage.length > 0){
          return product.product.censoredImage['desktopSmall'];
        } else {
          return product.product.mainImage.desktopSmall;
        }
      } else {
        if(product.product.censoredImage.length > 0){
          return product.product.censoredImage['mobileSmall'];
        } else {
          return product.product.mainImage.mobileSmall;
        }
      }
    } else {
      return "";
    }
  }

}

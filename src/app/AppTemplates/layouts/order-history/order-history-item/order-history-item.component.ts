import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { orderHistoryElementProducts, ordersHystoryItem } from '../../../../AppTemplates/services/Portal/closed-api.service';


@Component({
  selector: 'app-order-history-item',
  templateUrl: './order-history-item.component.html',
  styleUrls: ['./order-history-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrderHistoryItemComponent implements OnInit {

  @Input() item : ordersHystoryItem;
  @Input() orderItemProducts: orderHistoryElementProducts|null;
  @Output() itemID: EventEmitter<number> = new EventEmitter();
  @Output() getProductsByID: EventEmitter<number> = new EventEmitter();

  checkedItems: [{id:number, quantity:number}]|any = [];

  constructor() { }

  ngOnInit(): void {
    
  }

  returnDate(date:string){
    let b = date.split(' ');
    return b;
  }

  returnCheckedAll() : boolean {
    let a = this.orderItemProducts.items.filter(item => item.product.price != null);   
    return a.length === this.checkedItems.length
  }

  checkAllItems(){
    let a : [{id:number, quantity:number}]|any = [];
    if(this.checkedItems && this.checkedItems.length > 0){
      this.checkedItems = [];
      return
    } else {
      for(let i = 0; i<this.orderItemProducts.items.length; i++){
        let item = this.orderItemProducts.items[i];
        if(item.quantity && item.product.price){
          let event = {id:item.product.id, quantity: item.quantity}
          this.toggleChecked(event);
        }
      }
    }
  }

  toggleChecked(event:{id:number, quantity:number}) {
    if(this.checkedItems && this.checkedItems.length){
      if(this.checkedItems.filter(item => item.id == event.id).length){
        this.checkedItems = this.checkedItems.filter(item => item.id !== event.id)
      } else {
        this.checkedItems.push(event)
      }
    } else {
      this.checkedItems.push(event);
    }
  }

}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderHistoryComponent } from './order-history.component';
import { OrderHistoryItemComponent } from './order-history-item/order-history-item.component';
import { OrdersHistoryProductComponent } from './order-history-item/orders-history-product/orders-history-product.component';
import { RouterModule } from '@angular/router';
import { LoaderModule } from '../../../components/modules/loader/loader.module';



@NgModule({
  declarations: [OrderHistoryComponent, OrderHistoryItemComponent, OrdersHistoryProductComponent],
  imports: [
    CommonModule,
    RouterModule,
    LoaderModule
  ]
})
export class OrderHistoryModule { }

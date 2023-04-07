import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from './cart.component';
import { LoaderModule } from '../../../components/modules/loader/loader.module';
import { OrderComponent } from './order/order.component';
import { CartViewComponent } from './cart-view/cart-view.component';
import { ProductListItemModule } from '../../shared/product-list-item/product-list-item.module';
import { CartSidebarComponent } from './cart-sidebar/cart-sidebar.component';
import { CartPromocodeComponent } from './cart-promocode/cart-promocode.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { OrderCompleteComponent } from './order-complete/order-complete.component';
import { RouterModule } from '@angular/router';
import { TextMaskModule } from 'angular2-text-mask';


@NgModule({
  declarations: [CartComponent, OrderComponent, CartViewComponent, CartSidebarComponent, CartPromocodeComponent, OrderCompleteComponent],
  exports: [
    CartComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    LoaderModule,
    ProductListItemModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule,
    NgSelectModule,
    TextMaskModule,
  ],
  providers:[

  ]
})
export class CartModule { }

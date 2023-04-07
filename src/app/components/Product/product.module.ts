import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProductComponent} from './product.component';
import {ProductRoutingModule} from './product-routing.module';
import {LoaderModule} from '../modules/loader/loader.module';
import {FormsModule} from '@angular/forms';
import {ModalsModule} from '../../modals/modals.module';
import { SafeHtmlPipe } from './safe-html.pipe';
import {LazyLoadImageModule} from 'ng-lazyload-image';


@NgModule({
  declarations: [
    ProductComponent,
    SafeHtmlPipe
  ],
  exports: [
    SafeHtmlPipe
  ],
    imports: [
        CommonModule,
        ProductRoutingModule,
        LoaderModule,
        FormsModule,
        ModalsModule,
        LazyLoadImageModule
    ]
})
export class ProductModule { }

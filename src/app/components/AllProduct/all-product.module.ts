import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ClosedApiService } from "../../../app/AppTemplates/services/Portal/closed-api.service";
import { AppService } from "../../../app/app.service";
import { ProductRoutingModule } from "./all-product.routing.module";
import { AllProductService } from "./all-product.service";
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
  declarations: [
    ...ProductRoutingModule.component
  ],
  exports: [  ],
    imports: [
        CommonModule,
        FormsModule,
        ProductRoutingModule,
        ReactiveFormsModule,
        NgSelectModule
        
    ],
    providers:[AppService,ClosedApiService,AllProductService]
})
export class AllProductModule { }
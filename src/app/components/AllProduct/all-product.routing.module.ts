import { NewComponent } from './new_products/new.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActionComponent } from './actions/action.component';
import { FavoriteComponent } from './favorite-product/favorite-product.component';
import {  SearchProductComponent } from './search-product/search-product.component';
import { PageComponent } from './_page/page.component';
import { FilterComponent } from './filter-product/filter.component';
import { BrandComponent } from '../AllProduct/productBrands/brand.component';
import { UnitComponent } from '../AllProduct/productUnit/unit.component';


const routes: Routes = [
    {
        path: '',
        component: SearchProductComponent,
    },
    {
        path:"favorite",
        component: FavoriteComponent,
    },
    {
        path:"action",
        component:ActionComponent
    },
    {
        path:"new",
        component:NewComponent
    },
    {
        path:"brand",
        component:BrandComponent
    },
    {
        path:"unit",
        component:UnitComponent
    }
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class ProductRoutingModule {
    static component = [
        PageComponent,
        SearchProductComponent,
        FavoriteComponent,
        ActionComponent ,
        NewComponent,
        FilterComponent,
        BrandComponent,
        UnitComponent
    ]
}
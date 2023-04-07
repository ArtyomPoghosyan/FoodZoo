import { FavoriteComponent } from './components/AllProduct/favorite-product/favorite-product.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoriesComponent } from './components/Categories/categories.component';
import { CategoryComponent } from './components/Category/category.component';
import { PageNotFoundComponent } from './components/NotFound/page-not-found.component';
import { AgeComponent } from './components/Age/age.component';
import { InformationComponent } from './components/Information/information.component';
import { OrderProcessingComponent } from './components/OrderProcessing/order-processing.component';
import { PrivacyPolicyComponent } from './components/PrivacyPolicy/privacy-policy.component';
import { NotAllowedComponent } from './components/NotAllowed/not-allowed.component';
import { MainComponentComponent } from './AppTemplates/layouts/main-component/main-component.component';
import { CatalogComponent } from './components/Catalog/catalog.component';
import { ProfileComponent } from './AppTemplates/layouts/profile/profile.component';
import { CartComponent } from './AppTemplates/layouts/cart/cart.component';
import { OrderCompleteComponent } from './AppTemplates/layouts/cart/order-complete/order-complete.component';
import { OrderHistoryComponent } from './AppTemplates/layouts/order-history/order-history.component';


const routes: Routes = [
  { path: '',
    children: [
      { path: '', component: MainComponentComponent },
      { path: 'market', component: MainComponentComponent },
    ] },
  {
    path: 'catalog',
    component: CatalogComponent
  },
  {
    path: 'special/:specProd',
    component: CatalogComponent
  },
  {
    path: 'category',
    component: CategoriesComponent
  },
  {
    path: 'category/:id/catalog/:idcat',
    component: CategoryComponent
  },
  {
    path: 'category/:idcat',
    component: CategoryComponent
  },
  {
    path: 'brand/:brSlug',
    component: CategoryComponent
  },
  {
    path: 'category/:idcat/:subSlug',
    component: CategoryComponent
  },
  {
    path: 'product/:firstCat/:secondCat/:slug',
    loadChildren: () => import('./components/Product/product.module').then(m => m.ProductModule)
  },
  {
    path: 'product/:slug',
    loadChildren: () => import('./components/Product/product.module').then(m => m.ProductModule)
  },

  {
    path:'search',
    loadChildren: () => import('./components/AllProduct/all-product.module').then(i => i.AllProductModule),
  },
 

  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'not-that-age',
    component: AgeComponent
  },
  {
    path: 'cart',
    component: CartComponent,
    children: [
      {
      path: 'success',
      component: OrderCompleteComponent
    }]
  },
  {
    path: 'history-orders',
    component: OrderHistoryComponent
  },
  {
    path: 'order/:id',
    component: OrderProcessingComponent
  },
  {
    path: 'about',
    component: InformationComponent
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent
  },
  {
    path: '404',
    component: PageNotFoundComponent
  },
  {
    path: 'notallow',
    component: NotAllowedComponent
  },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
  }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }

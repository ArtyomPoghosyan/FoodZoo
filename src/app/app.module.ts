import { AppService } from './app.service';

import { BrowserModule, Meta } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {LoaderModule} from './components/modules/loader/loader.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CategoriesComponent } from './components/Categories/categories.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoryComponent } from './components/Category/category.component';
import { TextMaskModule } from 'angular2-text-mask';
import { OwlModule } from 'ngx-owl-carousel';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { HttpClientModule } from '@angular/common/http';
import {isPlatformServer, registerLocaleData} from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import localeRuExtra from '@angular/common/locales/extra/ru';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CategoryListComponent } from './components/modules/category-list/category-list.component';
import { PageNotFoundComponent } from './components/NotFound/page-not-found.component';
import { RegistrationFormCustomer } from './components/modules/registration-form-customer/registration-form-customer.component';
import { NgbdModalContentComponent } from './components/modules/registration-form-customer/registration-form-customer.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AgeComponent } from './components/Age/age.component';
import { HistoryOrdersComponent } from './components/HistoryOrders/history-orders.component';
import { InformationComponent } from './components/Information/information.component';
import { HistoryOrdersListComponent, HistoryOrdersListItemComponent } from './components/HistoryOrders/history-orders-list';
import { DatePipe } from '@angular/common';
import { ClickOutsideModule } from 'ng-click-outside';
import { NgAnimateScrollService } from 'ng-animate-scroll';
import { OrderProcessingComponent } from './components/OrderProcessing/order-processing.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalOrderProblemComponent } from './components/HistoryOrders/history-orders-list/modal-order-problem/modal-order-problem.component';
import {
    SocialLoginModule,
    AuthServiceConfig,
    FacebookLoginProvider,
    VkontakteLoginProvider,
} from 'angular-6-social-login-v2';
import { PrivacyPolicyComponent } from './components/PrivacyPolicy/privacy-policy.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NotAllowedComponent } from './components/NotAllowed/not-allowed.component';
import { TagInputModule } from 'ngx-chips';
import {CollapseModule} from 'ngx-bootstrap/collapse';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SidebarModule } from 'ng-sidebar';
import {VerifyModule} from './modals/verify/verify.module';
import { CookieModule } from 'ngx-cookie';
import {SkeletionModule} from './components/modules/skeletion-list/skeletion.module';
import {ModalsModule} from './modals/modals.module';
import {ProductModule} from './components/Product/product.module';
import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image';
import { FooterComponent } from './components/Footer/footer.component';
import { ModalsComponent } from './modals/modals.component';
import { SiteHeaderComponent } from './AppTemplates/shared/site-header/site-header.component';
import { AuthHeaderComponent } from './AppTemplates/shared/site-header/auth-header/auth-header.component';
import { NotAuthHeaderComponent } from './AppTemplates/shared/site-header/not-auth-header/not-auth-header.component';
import { SerachFormComponent } from './AppTemplates/shared/search-form/search-form.component';
import { MainComponentComponent } from './AppTemplates/layouts/main-component/main-component.component';
import { CategoryListItemComponent } from './AppTemplates/shared/category-list-item/category-list-item.component';
import { CatalogComponent } from './components/Catalog/catalog.component';
import { ProductListComponent } from './components/modules/product-list/product-list.component';
import { RegistrationModule } from './AppTemplates/shared/registration/registration.module';
import { ProfileModule } from './AppTemplates/layouts/profile/profile.module';
import { CartModule } from './AppTemplates/layouts/cart/cart.module';
import { ProductListItemModule } from './AppTemplates/shared/product-list-item/product-list-item.module';
import { ErrorsComponent } from './AppTemplates/shared/errors/errors.component';
import { OrderHistoryModule } from './AppTemplates/layouts/order-history/order-history.module';
import { ExponentialStrengthPipe } from './AppTemplates/shared/pipes/filter.pipe';
import { BrandListPipe } from './AppTemplates/shared/pipes/brandsFilter.pipe';
import { RestApiService } from './services/rest-api.service';
import { AllProductModule } from './components/AllProduct/all-product.module';
import * as dotenv from 'dotenv'
// import { NgxCaptch/aModule } from 'ngx-captcha';

registerLocaleData(localeRu, 'ru', localeRuExtra);

// Configs
export function getAuthServiceConfigs() {
    const config = new AuthServiceConfig(
        [
            {
                id: FacebookLoginProvider.PROVIDER_ID,
                provider: new FacebookLoginProvider('2643001385953431')
            },
            {
                id: VkontakteLoginProvider.PROVIDER_ID,
                provider: new VkontakteLoginProvider('7190559')
            },
        ]
);
    return config;
}
export function isBot(navigator, platformId) {
    return isPlatformServer(platformId) ? true : intersectionObserverPreset.isBot(navigator, platformId);
}
@NgModule({
    declarations: [
        AppComponent,
        CategoryListComponent,
        CategoriesComponent,
        PageNotFoundComponent,
        CategoryComponent,
        RegistrationFormCustomer,
        NgbdModalContentComponent,
        AgeComponent,
        HistoryOrdersComponent,
        InformationComponent,
        HistoryOrdersListComponent,
        HistoryOrdersListItemComponent,
        OrderProcessingComponent,
        ModalOrderProblemComponent,
        PrivacyPolicyComponent,
        NotAllowedComponent,
        // 
        CatalogComponent,
        ProductListComponent,
        // 
        FooterComponent,
        ModalsComponent,
        // Rewrited Components
        SiteHeaderComponent,
        AuthHeaderComponent,
        NotAuthHeaderComponent,
        SerachFormComponent,
        MainComponentComponent,
        CategoryListItemComponent,
        ErrorsComponent,
        ExponentialStrengthPipe,
        BrandListPipe
    ],
    entryComponents: [
        NgbdModalContentComponent
    ],
    imports: [
        FormsModule,
        BrowserModule.withServerTransition({appId: 'my-app'}),
        CookieModule.forRoot(),
        NgbModule,
        FormsModule,
        NgSelectModule,
        ReactiveFormsModule,
        AppRoutingModule,
        HttpClientModule,
        TextMaskModule,
        OwlModule,
        BsDatepickerModule.forRoot(),
        ClickOutsideModule,
        BrowserAnimationsModule,
        SocialLoginModule,
        Ng2SearchPipeModule,
        TagInputModule,
        CollapseModule,
        InfiniteScrollModule,
        SidebarModule,
        LoaderModule,
        VerifyModule,
        SkeletionModule,
        ModalsModule,
        ProductModule,
        LazyLoadImageModule,
        // new modules
        RegistrationModule,
        ProfileModule,
        CartModule,
        ProductListItemModule,
        OrderHistoryModule,
        AllProductModule,
  
    ],
    providers: [
        DatePipe,
        Meta,
        NgAnimateScrollService,
        RestApiService,
        AppService,
        {
            provide: AuthServiceConfig,
            useFactory: getAuthServiceConfigs
        },
        
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

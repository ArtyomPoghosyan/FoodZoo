
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationComponent } from './registration.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';
import { AuthFormComponent } from './auth-form/auth-form.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { NgxCaptchaModule } from 'ngx-captcha';
import { NgHcaptchaModule } from 'ng-hcaptcha';
import { environment } from '../../../../environments/environment';
@NgModule({
  declarations: [
    RegistrationComponent,
    AuthFormComponent,
    ConfirmationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TextMaskModule,
    NgxCaptchaModule,
    NgHcaptchaModule.forRoot({
      siteKey: environment.SITEKEY,
      // siteKey: '5e1da59a-1988-4986-a5f7-8dec25332115', // my site key 
      // siteKey: 'ee429 7fc-3bfe-446cgi-b685-ab6aa35e2088', // their site key need to use this....
      // siteKey: '590a7507-4718-47f1-ac84-fabbe1e06105', // their promo site key
      // siteKey: '10000000-ffff-ffff-ffff-000000000001', // test key 
       
      languageCode: 'ru'
    }),
  ],
  entryComponents: [
    RegistrationComponent,
  ],
  providers: []
})
export class RegistrationModule { }
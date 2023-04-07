import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UpdatePasswordComponent} from './update-password/update-password.component';
import {ReactiveFormsModule} from '@angular/forms';
import { AgeVerifyComponent } from './age-verify/age-verify.component';


@NgModule({
  declarations: [
    UpdatePasswordComponent,
    AgeVerifyComponent,
  ],
    exports: [
        UpdatePasswordComponent,
        AgeVerifyComponent
    ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class ModalsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { LoaderModule } from '../../../components/modules/loader/loader.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditProfileModalComponent } from './edit-profile-modal/edit-profile-modal.component';
import { TextMaskModule } from 'angular2-text-mask';



@NgModule({
  declarations: [
    ProfileComponent,
    EditProfileModalComponent
  ],
  imports: [
    CommonModule,
    LoaderModule,
    FormsModule,
    ReactiveFormsModule,
    TextMaskModule
  ],
  exports: [
    ProfileComponent
  ]
})
export class ProfileModule { }

import { AppService } from "../../../app/app.service";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import { SerachFormComponent } from './search-form/search-form.component';



@NgModule({
  declarations: [
    // SerachFormComponent
  ],
    exports: [

    ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers:[AppService]
})
export class SharedModule { }
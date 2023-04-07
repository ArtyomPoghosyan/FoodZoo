import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SkeleionListComponent} from './skeletion-list.component';
import {SkeletionListItemComponent} from './skeleion-list-item/skeletion-list-item.component';


@NgModule({
  declarations: [
    SkeleionListComponent,
    SkeletionListItemComponent
  ],
  exports: [
    SkeleionListComponent,
    SkeletionListItemComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SkeletionModule { }

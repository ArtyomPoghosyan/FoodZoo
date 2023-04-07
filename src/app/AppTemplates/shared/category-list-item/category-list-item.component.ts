import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-category-list-item',
  templateUrl: './category-list-item.component.html',
  styleUrls: ['./category-list-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CategoryListItemComponent implements OnInit {

  @Input() category:any = null;
  opened: boolean = false;
  constructor() { }

  ngOnInit(): void {}

  returnWidth(){
    return window.innerWidth;
  }

  returnOpened() {
    if(window && window.innerWidth <= 1100){
      this.opened = !this.opened;
    } else {
      return
    }
  }
  
}

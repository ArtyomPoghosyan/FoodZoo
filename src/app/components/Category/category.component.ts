import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UtilitesService } from '../../services/utilites.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CategoryComponent implements OnInit {
  constructor(private utilitiesService: UtilitesService) { }

  ngOnInit() {
    this.utilitiesService.headerState2(false);
    this.utilitiesService.hiddenFooter(false);
    this.utilitiesService.checkTypePage(true);
  }

}

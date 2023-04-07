import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UtilitesService } from '../../services/utilites.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CatalogComponent implements OnInit {

  constructor(private utilitiesService: UtilitesService) { }

  ngOnInit() {
    this.utilitiesService.headerState2(false);
    this.utilitiesService.hiddenFooter(false);
    this.utilitiesService.checkTypePage(false);
  }
}

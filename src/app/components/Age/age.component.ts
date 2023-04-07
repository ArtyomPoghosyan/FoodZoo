import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UtilitesService } from '../../services/utilites.service';

@Component({
  selector: 'app-age',
  templateUrl: './age.component.html',
  styleUrls: ['./age.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AgeComponent implements OnInit {

  constructor(private utilitiesService: UtilitesService) { }

  ngOnInit() {
   this.utilitiesService.headerState2(true);
   this.utilitiesService.hiddenFooter(true);
  }
}

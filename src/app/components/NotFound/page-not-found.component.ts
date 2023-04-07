import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {UtilitesService} from '../../services/utilites.service';

@Component({
    selector: 'app-page-not-found',
    templateUrl: './page-not-found.component.html',
    styleUrls: ['./page-not-found.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PageNotFoundComponent implements OnInit {

    constructor(
        private utilitiesService: UtilitesService
    ) {}

    ngOnInit() {
        this.setAllStates();
    }

    setAllStates() {
        this.utilitiesService.headerState2(false);
        this.utilitiesService.hiddenFooter(false);
    }

}

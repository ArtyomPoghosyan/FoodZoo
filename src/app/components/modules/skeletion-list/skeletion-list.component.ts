import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-skeletion-list',
    templateUrl: 'skeletion-list.component.html',
    styleUrls: ['skeletion-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SkeleionListComponent implements OnInit {
    @Input('mode') public isModeList = false;
    constructor() { }

    ngOnInit() { }
}

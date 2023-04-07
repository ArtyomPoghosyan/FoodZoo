import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-loader',
    templateUrl: 'loader.component.html',
    styleUrls: ['loader.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LoaderComponent implements OnInit {
    @Input('mode') public isModeList = false;
    constructor() { }

    ngOnInit() { }
}

import { Component, OnInit, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { OrderHistoryItem } from '../../history-orders.models';
import { DatePipe } from '@angular/common';
import { RestApiService } from '../../../../services/rest-api.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-history-orders-list-item',
    templateUrl: 'history-orders-list-item.component.html',
    styleUrls: ['history-orders-list-item.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HistoryOrdersListItemComponent implements OnInit {
    @Input('item') public item: any;
    @Input('typeUser') public typeUser: number;
    @Output('isOpened') private _isOpened: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output('sendProblem') private _sendProblem: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output('repeateOrder') private _repeatOrder: EventEmitter<boolean> = new EventEmitter<boolean>();
    private _isOpen: boolean = false;
    private _problem: boolean = false;
    private _order: boolean = false;
    isLoading: boolean = false;
    destroyStream$: Subject<any> = new Subject();

    constructor(private _datePipe: DatePipe, public rest: RestApiService, private router: Router) { }

    ngOnInit() {
    }

    public onClickOpen(id): void {
        if (this.typeUser !== 4) {
            this._isOpen = !this._isOpen;
            this._isOpened.emit(this._isOpen);
        } else {
            this.router.navigate(['/order', id]);
        }
    }

    public onClickedOutside($event): void {
        if (($event.target.getAttribute('class') !== 'modal_close') || ($event.target.getAttribute('class') !== null)) {
            this._isOpen = false;
            this._isOpened.emit(this._isOpen);
        }
    }
    public sendProblem($event) {
        this._problem = true;
        this._sendProblem.emit(this._problem);
    }
    public repeateOrder($event) {
        this._order = true;
        this._repeatOrder.emit(this._order);
    }
    
    get isOpen(): boolean {
        return this._isOpen;
    }
    getOrderExel(id, event) {
        event.preventDefault();
        event.stopPropagation();
        this.rest.getOrderExel(id).pipe(
            takeUntil(this.destroyStream$),
            finalize(() => this.checkIfIsLoading()),
        ).subscribe(link => {
            const linkSource = String(link) + '\n';
            const downloadLink = document.createElement("a");
            const fileName = "order-" + id + ".xlsx";
            downloadLink.href = linkSource;
            downloadLink.download = fileName;
            downloadLink.click();
        }, err => {});
    }

    checkIfIsLoading() {
        setTimeout(() => {
            this.isLoading = false;
        }, 1000);
    }

    ngOnDestroy() {
        this.destroyStream$.next(null);
        this.destroyStream$.complete();
    }

}
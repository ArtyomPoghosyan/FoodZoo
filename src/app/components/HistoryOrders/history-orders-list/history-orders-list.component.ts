import {Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import { OrderHistoryItem } from '../history-orders.models';
import { DatePipe } from '@angular/common';
import { RestApiService } from '../../../services/rest-api.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UtilitesService } from '../../../services/utilites.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { HelperServiceService } from '../../../AppTemplates/services/helpers/helper-service.service';
import { ClosedApiService } from '../../../AppTemplates/services/Portal/closed-api.service';
@Component({
    selector: 'app-history-orders-list',
    templateUrl: 'history-orders-list.component.html',
    styleUrls: ['history-orders-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HistoryOrdersListComponent implements OnInit {
    @Input('items') public items: any;
    @Input('amount') public amount: any;
    @Input('isLoad') public isLoad: any;
    @Input('noMore') public noMore: any;
    @Output('item') public item: any;
    @Input('userType') public userType: number;
    @Output('userType') public typeUser: number;
    @Output() private update: EventEmitter<any> = new EventEmitter();
    @Output()  pagination: EventEmitter<any> = new EventEmitter();
    @ViewChild('modalProblemOrder') private modalProblemOrder;
    @Output() orderEvent = new EventEmitter<any>();

    closeResult: string|null = null;
    modalReference: any = null;
    private _rightCardInfo: any = null;
    selectReason: string|null = null;
    isOpend: boolean = false;
    oneClick: boolean = false;
    modalClick: boolean = false;
    comment: string = '';
    isLoading: boolean = false;
    success_send: boolean = false;
    error_send: boolean = false;
    totalTrue: boolean = false;
    totalCart: number|null = null;
    orderProblemId: number|null = null;
    problemMessage: string|null = null;
    destroyStream$ : Subject<any> = new Subject();

    constructor(
        public helperService: HelperServiceService,
        private modalService: NgbModal,
        private utilitiesService: UtilitesService,
        private _datePipe: DatePipe,
        public rest: RestApiService,
        private closedApi: ClosedApiService,
        private router: Router) { }

    ngOnInit() {}

    public totalOrders() {
        this.items.forEach(element => {
            element['amount'];
        });
    }

    onSelectListItem() {
        this.pagination.emit();
    }

    public handleIsOpenedEvent($event: boolean, index: number): void {
        this.totalOrders();
        if ($event) {
            this.isOpend = true;
            this._rightCardInfo = this.items[index];
            this.orderProblemId = this._rightCardInfo['id'];
        }
        else {
            if (this.rightCardInfo && this._rightCardInfo.id === this.items[index].id) {
                this._rightCardInfo = null;
                this.isOpend = false;
            }
        }
    }

    public handleIsSendEvent($event: boolean): void {
        if ($event) {
            this.modalReference = this.modalService.open(this.modalProblemOrder, { centered: true});
        }
    }

    public handleIsRepeateEvent($event: boolean): void {
        if ($event) {
            this.repeatOrder($event, this._rightCardInfo);
        }
    }

    prevent($event) {
        $event.preventDefault();
        $event.stopPropagation();
    }

    get rightCardInfo() {
        return this._rightCardInfo;
    }

    modalProblem($event, order) {
        this.orderProblemId = order['id'];
        console.log(this.orderProblemId);
        this.modalReference = this.modalService.open(this.modalProblemOrder, { centered: true});
    }

    setProblem($event) {
        $event.stopPropagation();
        this.modalClick = true;
        this.rest.setOrderProblem(this.orderProblemId, this.comment).pipe(
            takeUntil(this.destroyStream$),
            finalize(() => this.checkIfIsLoading()),
        ).subscribe(data => {
            if (data['error'] === 0) {
                this.success_send = true;
                this.update.emit();
                this.orderEvent.emit([]);
                this._rightCardInfo = null;
            } else {
                this.error_send = true;
            }
            this.problemMessage = data['message'];
            setTimeout(() => {
                this.modalClick = false;
                this.modalReference.close();
                this.success_send = false;
                this.error_send = false;
                this.comment = '';
                this.problemMessage = '';
            }, 2000);

        }, e=>{});
    }

    repeatOrder(event, order) {
        this.oneClick = true;
        this.rest.repeatOrder(order['id']).pipe(
            takeUntil(this.destroyStream$),
            finalize(() => this.checkIfIsLoading()),
        ).subscribe(data => {
            if (data['error'] === 0) {
                this.getTotalCart();
                setTimeout(() => {
                    this.router.navigate(['/cart']);
                    this.oneClick = false;
                }, 2000);
            } else {
                if (Number(sessionStorage.getItem('totalAmount')) > 0) {
                    this.problemMessage = 'Для повторного заказа, удалите товары из корзины';
                } else {
                    this.problemMessage = data['message'];
                }
                this.error_send = true;
                this.modalReference = this.modalService.open(this.modalProblemOrder, { centered: true});
                setTimeout(() => {
                    this.problemMessage = '';
                    this.modalReference.close();
                    this.oneClick = false;
                    this.error_send = false;
                }, 2000);
            }
        }, e=>{});
    }

    getTotalCart() {
        this.closedApi.getCartTotal().pipe(
            takeUntil(this.destroyStream$),
            finalize(() => this.checkIfIsLoading()),
        ).subscribe(total => {
            this.totalCart = total['totalAmount'];
            if (this.totalCart !== 0) {
                this.totalTrue = true;
            } else {
                this.totalTrue = false;
                sessionStorage.removeItem('totalAmount');
            }
            sessionStorage.setItem('totalAmount', String(this.totalCart));
            this.helperService._totalCartEvent.emit(this.totalCart);
        }, err => {
            this.totalCart = 0;
            this.totalTrue = false;
            sessionStorage.removeItem('totalAmount');
        });
    }
    checkIfIsLoading() {
        setTimeout(() => {
            this.isLoading = false;
        }, 1000);
    }

    ngOnDestroy(){
        this.destroyStream$.next(null);
        this.destroyStream$.complete();
    }
}

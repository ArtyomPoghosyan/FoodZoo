import { Injectable, EventEmitter } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilitesService {
  private catalog_number: number;
  private typeModal: number;
  private userName: string;
  private is_products: boolean;
  private isOpen: boolean;
  private headerState: boolean;
  private headerState3: boolean;
  private hideFooter: boolean;
  private check: boolean;
  private auth: boolean;
  private typePage: boolean;
  private route: boolean;

  sortCatalogEvent = new EventEmitter();
  downloadProductsEvent = new EventEmitter();
  authEvent = new EventEmitter();
  headerStateEvent = new EventEmitter();
  headerState3Event = new EventEmitter();
  hiddenFooterEvent = new EventEmitter();
  hiddenCheckCard = new EventEmitter();
  checkTypePageEvent = new EventEmitter();

  userNameEvent = new EventEmitter();
  ModalEvent = new EventEmitter();
  filterEvent = new EventEmitter();
  sendStatusSearchEvent = new EventEmitter();
  hideProductSearchEvent = new EventEmitter();
  
  sendCountEvent = new EventEmitter();
  sendTimeStatusEvent = new Subject();
  sendAgainEvent = new Subject();
  sendCodeEvent = new Subject();
  closeModalEvent = new Subject();
  sendLimitEvent = new Subject();
  ageConfirmEvent = new Subject();
  checkModalEvent = new Subject();
  cutBrandCountEvent = new Subject();
  cutBrandCountSeoEvent = new Subject();
  twiceEvent = new Subject();
  private _changeRegionIdEvent: Subject<number> = new Subject<number>();
  private _changeRegionIdEventState: Observable<number>;

  constructor() {
    this._changeRegionIdEventState = this._changeRegionIdEvent.asObservable();
  }
  // header sort for catalogs
  public setSortCatalogId(id) {
    this.catalog_number = id;
    this.sortCatalogEvent.emit(this.catalog_number);
  }
  // check visibility header catalog
  public downloadProducts(bool) {
    this.is_products = bool;
    this.downloadProductsEvent.emit(this.is_products);
  }
  public hideProductSearch(data) {
    this.hideProductSearchEvent.emit(data);
  }

  public sendStatusSearch(bool) {
    this.sendStatusSearchEvent.emit(bool);
  }

  public sendCount(num) {
    this.sendCountEvent.emit(num);
  }
  public sendTimeStatus(bool) {
    this.sendTimeStatusEvent.next(bool);
  }
  public sendAgain(bool) {
    this.sendAgainEvent.next(bool);
  }
  public sendCode(str) {
    this.sendCodeEvent.next(str);
  }
  public closeModal(bool) {
    this.closeModalEvent.next(bool);
  }
  public sendLimit(bool) {
    this.sendLimitEvent.next(bool);
  }
  public ageConfirm(bool) {
    this.ageConfirmEvent.next(bool);
  }
  public filterOpen(bool) {
    this.isOpen = bool;
    this.filterEvent.emit(this.isOpen);
  }
  // check visibility header catalog
  public headerState2(bool) {
    this.headerState = bool;
    this.headerStateEvent.emit(this.headerState);
  }
  public headerStateOrder(bool) {
    this.headerState3 = bool;
    this.headerState3Event.emit(this.headerState3);
  }
  public hiddenFooter(bool) {
    this.hideFooter = bool;
    this.hiddenFooterEvent.emit(this.hideFooter);
  }
  public checkCard(bool) {
    this.check = bool;
    this.hiddenCheckCard.emit(this.check);
  }
  // authorization
  public checkAuthorization(bool) {
    this.auth = bool;
    if (!bool) {
      localStorage.removeItem('userData');
      localStorage.removeItem('registrationEmail');
      sessionStorage.removeItem('totalAmount');
    }
    this.authEvent.emit(this.auth);
  }
  
  // choose region
  public checkTypePage(bool) {
    this.typePage = bool;
    this.checkTypePageEvent.emit(this.typePage);
  }
  // choose region

  public setNewUserName(name) {
    this.userName = name;
    this.userNameEvent.emit(this.userName);
  }
  public openModal(type) {
    this.typeModal = type;
    this.ModalEvent.emit(this.typeModal);
  }
  public checkModal(type) {
    this.checkModalEvent.next(type);
  }
  public cutBrandCount(type) {
    this.cutBrandCountEvent.next(type);
  }
  public cutBrandCountSeo(type) {
    this.cutBrandCountSeoEvent.next(type);
  }
  public twice(type) {
    this.twiceEvent.next(type);
  }
}

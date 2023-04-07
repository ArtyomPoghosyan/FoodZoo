import { EventEmitter, Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class HelperServiceService {

  // new auth
  userData: any;
  // 
  _opened:boolean = false;
  _hideFooter:boolean = false;
  _filterCount:number = 0;
  
  // checkers
  _sendStatusEvent: EventEmitter<boolean> = new EventEmitter();
  _totalCartEvent: EventEmitter<number> = new EventEmitter();
  
  constructor(
    private readonly modalService: NgbModal,
  ) { }
  
  // modals
  _open(component): void {
    this.modalService.open(component, {centered: true, backdropClass: 'app-modal-bg'});
  }
  
}

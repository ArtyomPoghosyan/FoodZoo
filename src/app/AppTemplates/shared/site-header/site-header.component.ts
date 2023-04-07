import { Location } from '@angular/common';
import { Component, enableProdMode, OnInit, Output, ViewEncapsulation, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HelperServiceService } from '../../services/helpers/helper-service.service';
import { ClosedApiService } from '../../services/Portal/closed-api.service';
import { AppLocalStorageService } from '../../services/storages/app-local-storage.service';
import { AppSessionStorageService } from '../../services/storages/app-session-storage.service';

enableProdMode()

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SiteHeaderComponent implements OnInit {
  burgerOpen:boolean = false;
  auth:boolean = false;
  totalCart:number = 0;
  catShow:boolean = false;
  userData:any = null;
  isLoading:boolean = false;
  destroyStream$ = new Subject();

  @Output() LoginModal: EventEmitter<boolean> = new EventEmitter()

  constructor(
    private localStorage: AppLocalStorageService,
    private sessionStorage: AppSessionStorageService,
    private location: Location,
    private helperService: HelperServiceService,
    private router: Router,
    private closedApi: ClosedApiService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;    
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  returnTotalCart(){
    return Number(this.sessionStorage.getItem('totalAmount'));
  }

  ifIsCat(){
    if(this.router.url === ( '/profile' || '/orders-limit' )){
      return true
    } else {
      return false
    }
  }

  showFilter(){
    let url = this.router.url;
    if(url.split('/')[2] === 'catalog' || url.split('?')[0] === '/catalog' || url.split('/')[1] === 'category' || url === '/catalog' || url === '/catalog#' || url.split('/')[1] === ('brand'||'special')){
      return true
    } else {
      this.helperService._opened = false;
      return false
    }
  }

  returnAuth(){
    if(this.localStorage.getItem('UData') != undefined || this.localStorage.getItem('UData') != null){
      this.userData = JSON.parse(this.localStorage.getItem('UData'));
      return true;
    } else {
      return false;
    }
  }

  openBurger(e){
    this.burgerOpen = e;
  }

  backClicked(e){
    if(e){ this.location.back(); } 
    else { return }
  }

  ngOnDestroy(){
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }

}

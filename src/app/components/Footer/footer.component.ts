import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UtilitesService } from '../../services/utilites.service';
import { RestApiService } from '../../services/rest-api.service';
import { AppSessionStorageService } from '../../AppTemplates/services/storages/app-session-storage.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HelperServiceService } from '../../AppTemplates/services/helpers/helper-service.service';
import { AppLocalStorageService } from '../../AppTemplates/services/storages/app-local-storage.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FooterComponent implements OnInit {
  hide:boolean = false;
  ControlCatalog:boolean = true;
  activeCatalog: string|null = null;
  isLoading:boolean = true;
  _opened: boolean = false;
  destroyStream$: Subject<any> = new Subject();
  today = new Date();
  constructor(
    public sessionStorage: AppSessionStorageService,
    private localStorage: AppLocalStorageService,
    public rest: RestApiService,
    public helperService: HelperServiceService,
    private utilitiesService: UtilitesService
  ) { }

  ngOnInit() {
    this.listenerStates();

    this.activeCatalog = this.sessionStorage.getItem('catalogActive');

    this.utilitiesService.filterEvent.pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
        (status:boolean) => {
         this.hide = status;
        },
        e=>{}
    );

    this._opened = this.helperService._opened;
  }

 checkHideFooter() {
   this.utilitiesService.hiddenFooterEvent.pipe(
     takeUntil(this.destroyStream$)
   ).subscribe(
      (hidden:boolean) => {
        this.hide = hidden;
      },
      e=>{}
    );
  }

  modalOpen(type) {
    this.utilitiesService.openModal(type);
  }

  sortForCatalog(id) {
    this.utilitiesService.setSortCatalogId(id);
  }

  checkIfIsLoading() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  listenerStates() {
    this.checkHideFooter();
    this.checkTypePage();
  }

  returnUserId(){
    if(this.localStorage.getItem('UData')){
      return JSON.parse(this.localStorage.getItem('UData')).profile.id
    } else {
      return 
    }
  }

  checkTypePage() {
    this.utilitiesService.checkTypePageEvent.pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      (type:boolean) => {
        this.ControlCatalog = type;
      }
    );
  }

  ngOnDestroy(){
    this.destroyStream$.next();
    this.destroyStream$.complete();
  }

}

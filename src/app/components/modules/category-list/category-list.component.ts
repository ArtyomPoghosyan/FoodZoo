import {Component, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { UtilitesService } from '../../../services/utilites.service';
import { RestApiService } from '../../../services/rest-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import {Meta, Title} from '@angular/platform-browser';
import {Subject, Subscription} from 'rxjs';
import {CookieService} from 'ngx-cookie';
import { AppSessionStorageService } from '../../../AppTemplates/services/storages/app-session-storage.service';
import { takeUntil } from 'rxjs/operators';
import { AppLocalStorageService } from '../../../AppTemplates/services/storages/app-local-storage.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorsService, Error, ERRORSTYPES } from '../../../AppTemplates/shared/errors/service/errors.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CategoryListComponent implements OnInit, OnDestroy {

  @Input() h1:boolean = false;

  categorieslist: any = null;
  isLoading:boolean = true;
  getDataLoading:boolean = true;
  screenWidth: number|null = null;
  hasCensored: boolean = false;
  status: boolean = false;
  seoH1: string|null = null;
  seoText: string|null = null;
  prevUrl: any = null;

  destroyStream$: Subject<any> = new Subject();

  sub: Subscription;

  constructor(
    private errorsService: ErrorsService,
    private utilitiesService: UtilitesService,
    public rest: RestApiService,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private metaService: Meta,
    public cookie: CookieService,
    public sessionStorage: AppSessionStorageService,
    public localStorage: AppLocalStorageService) { }

  ngOnInit() {
    setTimeout(() => {
      this.getSeo('category');
      this.localStorage.removeItem('hash');
    }, 500);

    this.route.params.pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(params => {
      this.categorieslist = [];
      this.isLoading = true;
      this.getCategories();
      this.utilitiesService.ageConfirmEvent.pipe(
        takeUntil(this.destroyStream$)
      ).subscribe((st) => {
        if (st) {
          this.categorieslist = [];
          this.getCategories();
          this.status = true;
        } else {
          this.status = false;
        }
      },e=>{});
      this.status = this.cookie.get('ageConfirm') === '1';
    },e=>{});

    this.screenWidth = window.innerWidth;

  }

  setError(r:any, e?:HttpErrorResponse){
    let id = 0;
    if(this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]){
        id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
    }
    if(!!e){
        let error: Error = {
            errorMessage: e.message,
            errorType: ERRORSTYPES.INSIDE,
            errorCode: e.status,
            errorID: id
        }
        this.errorsService.setErrors(error);
    } else {         
        let error: Error = {
            errorMessage: r.message,
            errorType: ERRORSTYPES.DEFAULT,
            errorCode: r.error,
            errorID: id
        }
        this.errorsService.setErrors(error);
    }
  }

  getCategories() {
    this.getDataLoading = true;
    this.rest.getCategories()
      .then(categorieslist => {
        if(categorieslist['error'] !== 0){
          this.setError(categorieslist);
        }
        if (this.sessionStorage.getItem('prevUrl')) {
         this.prevUrl = this.sessionStorage.getItem('prevUrl').split('category_ids%5B%5D=');
        }
        categorieslist['items'].forEach((s, index, arr) => {
          if (this.prevUrl) {
            if (s['id'] === +this.prevUrl[1]) {
              s['opened'] = true;
            }
            if (s['subcats']) {
              s['subcats'].forEach((y) => {
                if (y['id'] === +this.prevUrl[1]) {
                  s['opened'] = true;
                }
              });
            }
          }
          if (s['censoredImage']['desktop']) {
            s['status'] = !this.status;
          }
          this.categorieslist.push(s);
        });
        if (categorieslist['hasCensored']) {
          this.hasCensored = categorieslist['hasCensored'];
        }
        setTimeout(() => {
          this.getDataLoading = false;
        }, 1000);
      }, err => {
        this.categorieslist = [];
        this.setError(null, err);
      });
  }

  convertNumber(value) {
    return Number(value);
  }

  getSeo(seoPageName) {
    this.rest.getSeoProperties(seoPageName).then((seoProp) => {
      if (seoProp['error'] === 0) {
        this.titleService.setTitle(seoProp['seo']['title']);
        this.metaService.updateTag({name: 'description', content: seoProp['seo']['description']});
        this.metaService.updateTag({name: 'keywords', content: seoProp['seo']['keywords']});
        this.seoH1 = seoProp['seo']['h1'];
        this.seoText = seoProp['seo']['text'];
      } else {
        this.setError(seoProp);
      }
    }, err=>{
      this.setError(null, err);
    });
  }

  toggleCategory(category) {
    this.categorieslist.forEach(element => {
      if (element['id'] !== category['id']) {
        element['opened'] = false;
      }
    });
    category['opened'] = category['opened'] ? false : true;
  }

  checkIfIsLoading() {
    this.utilitiesService.downloadProducts(true);
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  stopEvent(e, st, id) {
    this.localStorage.setItem('catId', id);
    if (st === true) {
      e.preventDefault();
      e.stopPropagation();
      this.utilitiesService.checkModal(true);
      return;
    }
  }

  returnWidth(){
    return window.innerWidth;
  }

  ngOnDestroy() {
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }
}

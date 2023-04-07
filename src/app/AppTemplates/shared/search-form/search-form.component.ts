import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilitesService } from '../../../services/utilites.service';
import { HelperServiceService } from '../../services/helpers/helper-service.service';
import { SharedApiService } from '../../services/Portal/shared-api.service';
import { CookieService } from 'ngx-cookie';
import { ErrorsService, ERRORSTYPES, Error } from '../errors/service/errors.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RestApiService } from '../../../services/rest-api.service';
import { ProductsListService } from '../../../services/ProductsList/products-list.service';
import { AppService } from "../../../../app/app.service"
import { AppLocalStorageService } from '../../services/storages/app-local-storage.service';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SerachFormComponent implements OnInit {

  public getAllProductCategories: any
  public getfilteredProducts = []

  @Input() filterShow: boolean = false;

  cutBrandCl: boolean = false;
  searchCategorytList: any = null;
  searchProductList: any = null;
  isLoadingSearch: boolean = false;
  isErrorSearch: boolean = false;
  isSerchErrorCode: number | null = null;

  srcForm: FormGroup = new FormGroup({
    srcString: new FormControl("", [])
  })

  destroyStream$: Subject<any> = new Subject();

  constructor(
    public helperService: HelperServiceService,
    public sharedApiService: SharedApiService,
    public restApiService: RestApiService,
    private router: Router,
    private cookie: CookieService,
    private errorsService: ErrorsService,
    public localStorage: AppLocalStorageService,
    // Must be deleted
    private utilitiesService: UtilitesService,

    public productsListService: ProductsListService,
    public appService: AppService,

    // public MainService:MainService
  ) {
    this.restApiService.getCategories()
      .then((resp) => {
        this.getAllProductCategories = resp
      })
  }

  ngOnInit(): void {
    (window && window.innerWidth <= 1206) ? this.helperService._hideFooter = true : this.helperService._hideFooter = false;
  }

  returnSearchString() {
    return this.srcForm.value.srcString;
  }

  searchProduct() {
    if (this.returnSearchString()?.trim().length > 0) {
      this.searchProductList = null;
      this.searchCategorytList = null;
      this.isSerchErrorCode = null;
      this.isErrorSearch = false;
      this.isLoadingSearch = false;
    }
  }

  searchImkrement(val, event) {
    let eCod = event.keyCode;
    if (eCod !== (13 || 37 || 38 || 39 || 40 || 32)) {
      this.isLoadingSearch = true;
      if (val.trim().length > 0) {
        this.sharedApiService.getSearchResult(encodeURIComponent(val)).pipe(
          takeUntil(this.destroyStream$)
        ).subscribe((r) => {
          if (r.error == 0) {
            this.searchCategorytList = r.categories;
            this.searchProductList = r.products;
            setTimeout(() => {
              this.isLoadingSearch = false;
            }, 1000);
          } else {
            let id = 0;
            if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
              id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
            }
            let error: Error = {
              errorMessage: r.message,
              errorType: ERRORSTYPES.DEFAULT,
              errorCode: r.error,
              errorID: id
            }
            this.errorsService.setErrors(error);
          }
        }, (e: HttpErrorResponse) => {
          this.isErrorSearch = true;
          this.isSerchErrorCode = e.status;
          setTimeout(() => {
            this.isErrorSearch = false;
            this.isSerchErrorCode = null;
          }, 10000);
          let id = 0;
          if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
            id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
          }
          let error: Error = {
            errorMessage: e.error.message,
            errorType: ERRORSTYPES.DEFAULT,
            errorCode: e.status,
            errorID: id
          }
          this.errorsService.setErrors(error);
        })
      }
    }
  }

  cleareSearch() {
    this.srcForm.reset();
    this.searchProductList = null;
    this.searchCategorytList = null;
    this.isSerchErrorCode = null;
    this.isErrorSearch = false;
    this.isLoadingSearch = false;
  }

  _toggleSidebar() {
    this.helperService._opened = !this.helperService._opened;
  }

  cleareFilter() {
    this.helperService._sendStatusEvent.emit(true);
    this.helperService._opened = false;
    this.helperService._filterCount = 0;
  }

  redirectToCategory(id, parentId, type) {
    let status = this.cookie.get('ageConfirm') === '1';
    if (parentId === null) {
      const url = '/category/catalog';
      this.helperService._hideFooter ? this.router.navigate([url, id, { msg: false }]) : this.router.navigate([url, id]);
    } else {
      if (type && !status) {
        this.utilitiesService.checkModal(true);
        return;
      } else {
        this.router.navigate(['/catalog'], { queryParams: { [`category_ids[${id}]`]: id } });
      }
    }
    setTimeout(() => {
      this.cleareSearch();
    }, 500);
  }

  public searchButton(): void {

    let searchName: string = this.srcForm.value.srcString;
    this.localStorage.setItem('searchName', JSON.stringify(searchName));
    let searchItem = this.localStorage.getItem('searchName')
    searchItem = JSON.parse(searchItem);
    this.productsListService.reloadProduct.next(searchItem);


    let id: number;
    let productSubcats = this.getAllProductCategories.items.map(item => {
      return item.subcats
    })

    if (searchName) {
      productSubcats.filter(item => {
        item.forEach(el => {
          if (el.name.toLowerCase().includes(searchName.toLowerCase())) {
            if (el.name.split(",")[0].toLowerCase() == searchName.toLowerCase()) {
              return id = el.id
            }
            if (el.name.toLowerCase() == searchName.toLowerCase()) {
              return id = el.id
            }
            return
          }
        })
      })
      if (!id) {
        this.getAllProductCategories.items.map(item => {

          if (item.name.toLowerCase().includes(searchName.toLowerCase())) {
            return id = item.id
          }
        })
      }

      if (searchName && id) {
        this.router.navigate(['/catalog'], { queryParams: { [`category_ids[${id}]`]: id } })
      }

      else if (searchName && !id) {
        this.router.navigate(['/search'], { queryParams: { search: `${searchName}` } })
      }
    }
    else if (!searchName) {
      alert("Нету такого товара")
    }
    this._SetpatchValue();
    this.searchCategorytList = null;
    this.searchProductList = null;
  }

  private _SetpatchValue() {
    this.srcForm.patchValue({
      srcString: null
    })
  }

  stopEvent(st: any, e?: any) {
    let status = this.cookie.get('ageConfirm') === '1';
    if (st === true && !status) {
      e.preventDefault();
      e.stopPropagation();
      this.utilitiesService.checkModal(true);
      this.router.navigateByUrl(this.router.url)
      return
    }
    setTimeout(() => {
      this.cleareSearch();
    }, 500);
  }

  ngOnDestroy() {
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }

}

import { ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Inject, Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { SharedApiService } from '../../services/Portal/shared-api.service';
import { takeUntil } from 'rxjs/operators';
import { ClosedApiService } from '../../services/Portal/closed-api.service';
import { ErrorsService, Error, ERRORSTYPES } from '../../shared/errors/service/errors.service';
import { HttpErrorResponse } from '@angular/common/http';

// import * as _ from 'lodash';

@Component({
  selector: 'app-main-component',
  templateUrl: './main-component.component.html',
  styleUrls: ['./main-component.component.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class MainComponentComponent implements OnInit {

  public items = []
  mainSlideImages: any = null;
  isLoading: boolean = false;
  isLoad: boolean = false;
  resScreen: boolean = false;
  totalCount: number = 0;
  seoText: string | null = null;
  newProducts: any[] | null;
  specialProducts: any[] | null;
  isLoadedSpecialProd: boolean = false;
  specialProductError: boolean = false;
  specialProductErrorCode: number | null = null;
  isLoadedNewProducts: boolean = false;
  newProductsListErrorCode: number | null = null;
  categorieslist: any = null;
  destroyStram$ = new Subject();
  mySlideOptions: any = {
    items: 1, dots: false, nav: true, loop: true, slideSpeed: 300, autoplay: false,
    autoplayTimeout: 1000, paginationSpeed: 400,
    navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
    startPosition: Math.floor(Math.random() * this.totalCount),
  };
  _mySlideOptions = {
    items: 5, dots: false, nav: true, loop: true, slideSpeed: 300, autoplay: false, rewind: true,
    autoplayTimeout: 1000, navClass: ['owl-prev', 'owl-next nextNewProd'],
    startPosition: Math.floor(Math.random() * this.totalCount),
    autoplayHoverPause: true, navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
    responsive: {
      0: { items: 2, loop: true, },
      400: { items: 2, loop: false, },
      600: { items: 3, loop: false, },
      768: { items: 3, loop: false, },
      1000: { items: 4, loop: false, },
      1220: { items: 5, loop: false, },
    }
  };

  constructor(
    private sharedApiService: SharedApiService,
    private closedApi: ClosedApiService,
    private errorsService: ErrorsService,
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    public cd: ChangeDetectorRef,
    @Inject(DOCUMENT) private dom

  ) {

  }

  ngOnInit(): void {
    this.closedApi.reloadBanners.subscribe((resp: any) => {
      // this.isLoadedNewProducts = false;
      // this.isLoadedSpecialProd = false;
      this.getMainPageProducts(0, 20, '&has_discount=1');
      this.getMainPageProducts(0, 20, '&is_new=1');
    })

    this.closedApi.getUserData().subscribe(resp => { })

    this.mySlideOptions = {
      items: 1, dots: false, nav: true, loop: true, slideSpeed: 300, autoplay: true,
      autoplayTimeout: 3000, paginationSpeed: 400,
      navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
      startPosition: Math.floor(Math.random() * this.totalCount)
    };
    setTimeout(() => {
      this.getAllBanners();
      this.isLoad = true;
    }, 500);
    this.setSeoProp()
    setTimeout(() => {
      this.getMainPageProducts(0, 20, '&has_discount=1');
    }, 600)
    setTimeout(() => {
      this.getMainPageProducts(0, 20, '&is_new=1');
    }, 550);
    this.getCategories();
  }

  identify(index, item) {
    return item.name;
  }

  getAllBanners() {
    this.isLoading = true;
    this.sharedApiService.getBanner().pipe(
      takeUntil(this.destroyStram$)
    ).subscribe(
      r => {
        if (r.error === 0) {
          this.mainSlideImages = r.items;
          this.isLoading = false;
          this.isLoad = true;
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
      },
      (e: HttpErrorResponse) => {
        this.isLoading = false;
        this.isLoad = true;
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
      }
    )
  }

  setSeoProp() {
    if (this.router.url === "/") {
      const link: HTMLLinkElement = this.dom.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.dom.head.appendChild(link);
      link.setAttribute('href', '/market');
    }
    this.sharedApiService.getSeoProperties("market").pipe(
      takeUntil(this.destroyStram$)
    ).subscribe(
      r => {
        if (r.error === 0) {
          this.titleService.setTitle(r.seo.title);
          this.metaService.updateTag({ name: 'description', content: r.seo.description });
          this.metaService.updateTag({ name: 'keywords', content: r.seo.keywords });
          this.seoText = r.seo.text;
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
      }
    )
  }

  getMainPageProducts(page: number, perPage: number, reqOption: string) {

    this.closedApi.getAllProducts(page, perPage, reqOption).pipe(
      
      takeUntil(this.destroyStram$)
    ).subscribe(
      r => {
        if (r.error === 0) {
          if (reqOption === '&has_discount=1') {
            this.specialProducts = r.items;
            this.isLoadedSpecialProd = true;
          } else if (reqOption === '&is_new=1') {
            this.newProducts = r.items;
            this.isLoadedNewProducts = true;
          }
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
      },
      (e: HttpErrorResponse) => {
        if (reqOption === '&has_discount=1') {
          this.specialProductError = true;
          this.specialProductErrorCode = e.status;
          setTimeout(() => {
            this.specialProductError = false;
            this.specialProductErrorCode = null;
          }, 10000);
        } else if (reqOption === '&is_new=1') {
          this.newProductsListErrorCode = e.status;
          setTimeout(() => {
            this.newProductsListErrorCode = null;
          }, 10000);
        }
        this.isLoadedSpecialProd = true;
        this.isLoadedNewProducts = true;
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
      }
    )



  }

  getCategories() {
    this.sharedApiService.getCategories().pipe(
      takeUntil(this.destroyStram$)
    ).subscribe(
      r => {
        if (r.error === 0) {
          this.categorieslist = r.items;
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
      },
      (e: HttpErrorResponse) => {
        this.categorieslist = null;
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
      }
    )
  }

  // Must be delted
  returnWidth() {
    return window.innerWidth;
  }

  ngOnDestroy() {
    this.destroyStram$.next();
    this.destroyStram$.complete();
  }
}

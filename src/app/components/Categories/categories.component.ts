import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UtilitesService } from '../../services/utilites.service';
import { ProductsListService } from '../../services/ProductsList/products-list.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import {CookieService} from 'ngx-cookie';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorsService, Error, ERRORSTYPES } from '../../AppTemplates/shared/errors/service/errors.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CategoriesComponent implements OnInit {

  h1:boolean = true;
  sortString:string = '';
  searchString:string = '';
  searchCategorytList: any = [];
  searchProductList: any = [];
  isLoading:boolean = true;
  queryParams: any = null;
  idCatalog: number|null = null;
  idCategory: number = 0;
  status: boolean = false;
  destroyStream$: Subject<any> = new Subject();

  constructor(
    private errorsService: ErrorsService,
    private utilitiesService: UtilitesService,
    public product_list_rest: ProductsListService,
    private router: Router,
    private route: ActivatedRoute,
    public cookie: CookieService,
    ) { }

  ngOnInit() {
    this.utilitiesService.headerState2(false);
    this.utilitiesService.hiddenFooter(false);
    this.utilitiesService.checkTypePage(true);

    this.idCatalog = +this.route.snapshot.paramMap.get('id');
    this.idCategory = +this.route.snapshot.paramMap.get('idcat');
    this.status = this.cookie.get('ageConfirm') === '1';
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

  /**
 * cleareSearch
 */

  public cleareSearch() {
    this.searchString = '';
    this.searchCategorytList = [];
    this.searchProductList = [];
  }

  public searchProduct() {
    this.searchCategorytList = [];
    this.searchProductList = [];
    if (this.searchString.length > 0 && this.searchString !== ' ') {
      this.router.navigate(['/catalog'], { queryParams: { pattern: this.searchString } });
    }
  }

  public checkIfIsLoading() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  redirectToCategory(id, type) {
    this.status = this.cookie.get('ageConfirm') === '1';
    const name = 'category_ids[]';
    this.queryParams = { [name]: id };
    if (type && !this.status) {
        this.utilitiesService.checkModal(true);
        return;
      } else {
        this.router.navigate(['/catalog'], { queryParams: this.queryParams });
    }
    this.searchCategorytList = [];
    this.searchProductList = [];
    this.searchString = '';
  }

  stopEvent(e, st) {
    this.status = this.cookie.get('ageConfirm') === '1';
    setTimeout(() => {
      this.status = this.cookie.get('ageConfirm') === '1';
    }, 1800);
    if (st === true && !this.status) {
      e.preventDefault();
      e.stopPropagation();
      this.utilitiesService.checkModal(true);
      return;
    }
  }

  public searchImkrement(val) {
    this.searchString = val;
    this.searchCategorytList = [];
    this.searchProductList = [];
    if (val.trim().length > 0) {
      this.product_list_rest.getSearchResult(val).pipe(
        takeUntil(this.destroyStream$),
        finalize(() => this.checkIfIsLoading()),
      ).subscribe(result => {
            if(result['error'] !== 0){
              this.setError(result)
            }
            if (result['query'] === this.searchString) {
                this.searchCategorytList = [];
                this.searchProductList = [];
                if (result['categories'].length > 0) {
                    result['categories'].forEach((item) => {
                        this.searchCategorytList.push(item);
                    });
                }
                if (result['products'].length > 0) {
                    result['products'].forEach((item) => {
                        this.searchProductList.push(item);
                    });
                }
            }
        }, err => {
          this.searchCategorytList = [];
          this.searchProductList = [];
          this.setError(null,err)
        });
    }

  }

  ngOnDestroy(){
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }

}

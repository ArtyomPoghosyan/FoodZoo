import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../../services/Products/product.service';
import { ProductsListService } from '../../../../services/ProductsList/products-list.service';
import { RestApiService } from '../../../../services/rest-api.service';
import { AppLocalStorageService } from '../../../../AppTemplates/services/storages/app-local-storage.service';
import { AppSessionStorageService } from '../../../../AppTemplates/services/storages/app-session-storage.service';
import { UtilitesService } from '../../../../services/utilites.service';
import { HelperServiceService } from '../../../services/helpers/helper-service.service';
import { AuthentificatedService } from '../../registration/services/auth.service';
import { ErrorsService, Error, ERRORSTYPES } from '../../errors/service/errors.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RegistrationComponent } from '../../../../AppTemplates/shared/registration/registration.component';

@Component({
  selector: 'app-auth-header',
  templateUrl: './auth-header.component.html',
  styleUrls: ['./auth-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AuthHeaderComponent implements OnInit {

  @Input() burgerOpen:boolean = false;
  @Input() userData:any;
  @Input() queryParams:any = null;
  @Input() totalCart:number = 0;
  @Output() openBurger: EventEmitter<boolean> = new EventEmitter();
  @Output() backClicked: EventEmitter<boolean> = new EventEmitter();
  subHeaderOpened: boolean = false;
  
  constructor(
    public helperService: HelperServiceService,
    private localStorage: AppLocalStorageService,
    private sessionStorage: AppSessionStorageService,
    private utilitiesService : UtilitesService,
    private rest : RestApiService,
    public product_rest: ProductService,
    public rest_product: ProductsListService,
    private router: Router,
    private authentificatedService: AuthentificatedService,
    private errorsService: ErrorsService
  ) { }

  ngOnInit(): void {
    
  }

  openSub(){
    if(window && window.innerWidth > 575){
      this.subHeaderOpened = true;
    } else {
      return
    }
  }

  openMobileSub() {
    if(window && window.innerWidth <= 575){
      this.subHeaderOpened = true;
    } else {
      return;
    }
  }

  viewRegForm(){
  
    this.skip();
    this.helperService._open(RegistrationComponent);

    
  }

  modalOpen(type:number) {
    this.utilitiesService.openModal(type)
  }

  logout(){
    this.sessionStorage.removeItem('totalAmount');
    this.localStorage.removeItem('userData');
    this.localStorage.removeItem('registrationEmail');
    this.localStorage.removeItem('promocode');
    this.localStorage.removeItem('UData');
    this.utilitiesService.checkAuthorization(false);
    this.utilitiesService.checkCard(false);
    this.rest.deleteAuthorizationToken();
    this.rest_product.deleteAuthorizationToken();
    this.product_rest.deleteAuthorizationToken();
    // this.skip();
    this.router.navigate(['/']);
  }

  skip(){
    this.authentificatedService.skipAuth().subscribe(
      r=>{
        if(r.error === 0){
          this.localStorage.setItem('UData', JSON.stringify(r))
        } else {
          let id = 0;
          if(this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]){
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
      (e:HttpErrorResponse)=>{
        let id = 0;
        if(this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]){
          id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
        }
        let error: Error = {
          errorMessage: e.error.message,
          errorType: ERRORSTYPES.INSIDE,
          errorCode: e.status,
          errorID: id
        }
        this.errorsService.setErrors(error);
      }
    )
  }

}

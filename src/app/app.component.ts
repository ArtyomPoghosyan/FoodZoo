import { Component, OnInit, OnDestroy, ViewEncapsulation, enableProdMode } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppSessionStorageService } from './AppTemplates/services/storages/app-session-storage.service';
import { AppLocalStorageService } from './AppTemplates/services/storages/app-local-storage.service';
import { SharedApiService } from './AppTemplates/services/Portal/shared-api.service';
import { HelperServiceService } from './AppTemplates/services/helpers/helper-service.service';
import { RegistrationComponent } from './AppTemplates/shared/registration/registration.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ClosedApiService } from './AppTemplates/services/Portal/closed-api.service';
import { ErrorsService, Error, ERRORSTYPES } from './AppTemplates/shared/errors/service/errors.service';
import { AuthentificatedService } from './AppTemplates/shared/registration/services/auth.service';

export let browserRefresh = false;

enableProdMode()

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})


export class AppComponent implements OnInit, OnDestroy {

  destroyStream$ : Subject<any> = new Subject();

  constructor(
    private router: Router,
    public sessionStorage: AppSessionStorageService,
    public localStorage: AppLocalStorageService,
    private sharedApiService: SharedApiService,
    private helperService: HelperServiceService,
    private closedApi: ClosedApiService,
    private errorsService: ErrorsService,
    private authService: AuthentificatedService
  ) {}
  

  ngOnInit() {
    const botPattern = '(googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest/0.|pinterestbot|slackbot|vkShare|W3C_Validator|whatsapp)';
    const re = new RegExp(botPattern, 'i');
    const userAgent = navigator.userAgent;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;
            this.yandexGeocod(longitude, latitude);
        }, error => {
            this.yandexGeocod(' ', ' ');
        });
    }

    if (re.test(userAgent)) {
      this.router.navigate(['/404']);
      return;
    }

    this.router.events.pipe(
        takeUntil(this.destroyStream$),
        filter(event => event instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
        this.sessionStorage.setItem('prevUrl', e.url);
        if (this.router.url.split('?')[0] !== '/catalog'
              && this.router.url.split('/')[1] !== 'product'
              && this.router.url.split('/')[1] !== 'category'
          ) {
              this.localStorage.removeItem('currentPage');
              this.localStorage.removeItem('hash');
          }
      }, error => {}
    );
    this.authCheker();
    setTimeout(() => {
      this.errorsService.canSetError = true
    }, 5000);


   } 

  yandexGeocod(long, lat) {
    if(long && lat){
      this.sharedApiService.yandexGeocoder(long, lat).pipe(
        takeUntil(this.destroyStream$)
      ).subscribe((res) => {
          let yandexGeocoder = res.response.GeoObjectCollection.featureMember[0].GeoObject.name;
          this.localStorage.setItem('yandexGeocoder', yandexGeocoder);
      }, err => {         
      });
    }
  }

  authCheker(){
    this.closedApi.getUserData().subscribe(
      r=>{
        if(r.error == 0){
          this.helperService.userData = r.profile;
          let user = JSON.parse(this.localStorage.getItem('UData'))
          user.profile = r.profile
          this.localStorage.setItem('UData', JSON.stringify(user));
          this.sessionStorage.setItem('totalAmount', r.profile.cartAmount)
        } else {
          this.setError(r);
        }
        this.closedApi.canGatByToken = true;
      },
      (e:HttpErrorResponse)=>{
        this.localStorage.setItem('cartData', JSON.stringify([]));
        this.sessionStorage.removeItem('totalAmount');
        if(e.status === 401){
          this.getUserIfHaveId();
        } else {
          this.setError(null, e);
          this.closedApi.canGatByToken = true;
        }
      }
    )
  }

  getUserIfHaveId(){
    if(this.localStorage.getItem('UData') && JSON.parse(this.localStorage.getItem('UData')).profile.id){
      this.authService.skipAuth(JSON.parse(this.localStorage.getItem('UData')).profile.id).pipe(
        takeUntil(this.destroyStream$)
      ).subscribe(r => {
        if(r.error === 0){
          this.localStorage.setItem('UData', JSON.stringify(r));
          this.sessionStorage.setItem('totalAmount', r.profile.cartAmount);
        } else {
          if(r.error === 3){
            this.localStorage.removeItem('UData')
            this.helperService._open(RegistrationComponent)
          }
          this.setError(r);
        }
        this.closedApi.canGatByToken = true;
      },
      e => {
        this.setError(null, e);
        this.closedApi.canGatByToken = true;
      })
    } else {
      this.localStorage.removeItem('UData');
      this.helperService._open(RegistrationComponent);
      this.closedApi.canGatByToken = true;
    }
  }

  setError(r:any, e?:HttpErrorResponse){
    let id = 0;
    if(this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]){
      id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
    }
    if(e) {
      let error: Error = {
        errorMessage: e.error.message,
        errorType: ERRORSTYPES.DEFAULT,
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

  ngOnDestroy() {
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }

  
}
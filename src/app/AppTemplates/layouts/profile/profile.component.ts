import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Subject, Subscription } from 'rxjs';
import { flatMap, takeUntil } from 'rxjs/operators';
import { USER } from '../../models/profile.models';
import { HelperServiceService } from '../../services/helpers/helper-service.service';
import { ClosedApiService } from '../../services/Portal/closed-api.service';
import { AppLocalStorageService } from '../../services/storages/app-local-storage.service';
import { ErrorsService, ERRORSTYPES, Error } from '../../shared/errors/service/errors.service';
import { AuthentificatedService } from '../../shared/registration/services/auth.service';
import { ProfileHelper } from './service/helper.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit {

  @Output() closeModal: EventEmitter<boolean> = new EventEmitter();

  public addcur: Subscription
  public currentLocation: any | undefined;
  public currentLocationData: any
  isLoading: boolean = true;
  regPhone: boolean = true;
  userData: USER;
  Edit?: EDITMODE;
  WiewEdit: boolean = false;
  EDITVALUES = EDITMODE;
  destroyStream$ = new Subject();
  nameForm: FormGroup = new FormGroup({
    value: new FormControl('', [Validators.pattern('^[А-Я|а-я|A-Z|a-z|ё|Ё| |-|]+$')])
  })

  constructor(
    private localStorage: AppLocalStorageService,
    private closedApi: ClosedApiService,
    private errorsService: ErrorsService,
    private authentificatedService: AuthentificatedService,
    private titleService: Title,
    private helperService: HelperServiceService,
    private profileHelper: ProfileHelper,

  ) { }

  ngOnInit(): void {
    this.updateSeo();
    setTimeout(() => {
      this.getUserData()
    }, 1000);
    this.authentificatedService.updateProfile.pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r => {
        this.getUserData();
      }
    )
    this.getUserAddress();
  }

  updateSeo() {
    this.titleService.setTitle('Профиль');
  }

  getUserData() {
    if (this.localStorage.getItem('UData')) {
      this.userData = (JSON.parse(this.localStorage.getItem('UData')) as USER)
      setTimeout(() => {
        this.isLoading = false;
      }, 200);
      if (this.userData.profile && this.userData.profile.name !== null) {
        this.nameForm.get('value').setValue(this.userData.profile.name);
      }
    }
  }

  public getUserAddress() {
    this.profileHelper.AddressState
      .subscribe(resp => {
        this.currentLocation = resp
      })
      this.closedApi.getUserData()
    .subscribe(resp =>{
      this.currentLocation=resp.profile.shownAddress
    })
    // this.currentLocationData = this.localStorage.getItem('Address');
  }

  changeStorage(choisNum: number) {
    if (choisNum === 1) {
      this.userData.profile.storeChoice = 2;
    } else if (choisNum === 2) {
      this.userData.profile.storeChoice = 1;
    } else {
      return
    }
  }

  changeEmailSendedStatus(status: number) {
    if (status == 0) {
      this.sendEmailStatus(1);
    }
    if (status == 1) {
      this.sendEmailStatus(0);
    }
  }

  sendEmailStatus(value: number) {
    this.closedApi.changeMailSenderStatus(value).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r => {        
        if (r.error === 0) {
          this.userData.profile.isEmailEnabled = value;
          let data = JSON.parse(this.localStorage.getItem('UData'));
          data.profile.isEmailEnabled = value;
          this.localStorage.setItem('UData', JSON.stringify(data));
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

  cnhageRecallStatus(status: number) {
    if (status == 0) {
      this.sendRecallStatus(1);
    }
    if (status == 1) {
      this.sendRecallStatus(0);
    }
  }

  sendRecallStatus(value: number) {
    this.closedApi.changeRecallStatus(value).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r => {
        if (r.error === 0) {
          this.userData.profile.isRecallEnabled = value;
          let data = JSON.parse(this.localStorage.getItem('UData'));
          data.profile.isRecallEnabled = value;
          this.localStorage.setItem('UData', JSON.stringify(data))
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

  viewEditModal(type: EDITMODE) {
    this.Edit = type;
    this.WiewEdit = true;
  }

  changeName(event: any) {
    if (!this.returnNameErrors()) {
      this.nameForm.get('value').setValue(
        this.nameForm.value.value.trim()
      )
      this.closedApi.cnageName(this.nameForm.value.value).pipe(
        takeUntil(this.destroyStream$)
      ).subscribe(
        r => {
          if (r.error === 0) {
            this.userData.profile.name = this.nameForm.value.value;
            this.localStorage.removeItem('UData');
            this.localStorage.setItem('UData', JSON.stringify(this.userData));
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
    } else {
      return;
    }
  }

  returnNameErrors() {
    let control = this.nameForm.get('value');
    if (control.hasError('pattern') && control.touched) {
      return "Введите корректное имя"
    } else if (control.value.trim() === "" && control.touched) {
      return "Имя не может состоять из одних пробелов!"
    } else {
      return false;
    }
  }

  ngOnDestroy() {
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }

}

export enum EDITMODE {
  E_MAIL = "E_MAIL",
  PHONE = "PHONE",
  NAME = "NAME",
  ADDRESS = "ADDRESS"
}

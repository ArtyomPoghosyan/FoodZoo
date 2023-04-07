import { EventEmitter, Injectable } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil, tap, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {

  constructor() { }

  error : EventEmitter<Error> = new EventEmitter();

  canSetError = false;

  errorsArray: Error[] = [];

  destroyStream$ = new Subject();

  setErrors(error:Error){
    if(this.canSetError){ 
      if(error.errorCode === 0){
        this.setNetworkError(error);
        return
      }
      let err = error;
      if(err.errorCode === (401||429)){
        err.errorType = ERRORSTYPES.DEFAULT;
        err.errorMessage = "Ошибка доступа. Перезагрузите страницу";
      } else if(err.errorCode === 1){
        err.errorType = ERRORSTYPES.INSIDE;
      } else if(err.errorCode === 2) {
        err.errorType = ERRORSTYPES.DEFAULT;
      } else if(err.errorCode >= 3 && err.errorCode < 100){
        err.errorType = ERRORSTYPES.WARNING
      }
      this.errorsArray.push(err);
      setTimeout(() => {
        this.clearError(err.errorID)
      }, 15000);
    }
  }

  setNetworkError(error:Error) {
    let hasError = this.errorsArray.filter(item => item.errorCode === 0 );
    if(hasError && hasError.length>0){
      return
    } else {
      let err = {
        errorType : ERRORSTYPES.DEFAULT,
        errorCode : 0,
        errorMessage : "Проверьте интернет соединение и перезагрузите страницу.",
        errorID : this.errorsArray.length
      }
      this.errorsArray.push(err)
    }
  }

  clearError(id:number){
    if(this.errorsArray.filter(error => error.errorID === id).length > 0){
      this.errorsArray = this.errorsArray.filter(item => item.errorID !== id);
    }
  }

}


export interface Error {
  errorType : ERRORSTYPES,
  errorCode ?: number,
  errorMessage : string,
  errorID : number
}

export enum ERRORSTYPES {
  INSIDE = "INSIDE",
  DEFAULT = "DEFAULT",
  WARNING = "WARNING"
}
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ErrorsService } from '../../errors/service/errors.service';
import { AuthentificatedService } from '../services/auth.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmationComponent implements OnInit {

  public backto: boolean = false;
  @Output() backToReg: EventEmitter<boolean> = new EventEmitter()

  @Output() resendCode: EventEmitter<{ url: string, value: string }> = new EventEmitter();
  @Output() skip: EventEmitter<boolean> = new EventEmitter();
  @Output() sendCode: EventEmitter<any> = new EventEmitter();
  @Output() back: EventEmitter<boolean> = new EventEmitter();
  @Input() captcha: boolean;
  @Input() sendError?: string;
  @Input() senderInfo: { url: string, value: string } = { url: "phone", value: "+7(945)123-45-67" }
  @Input() sendFormResponce: { error?: number, isNew?: number, message?: string, retryDelay?: number, timeout?: number } = {
    error: 999, isNew: 999, message: "lorem lorem", retryDelay: 60, timeout: 300
  }

  mask = [/\d/];
  destroyStream$ = new Subject();
  subscribeTimer: number = 60;

  @ViewChild('codeInputField') codeInputField: ElementRef;

  constructor(
    private errorsService: ErrorsService,
    public authentificatedService: AuthentificatedService,
  ) { }

  ngOnInit(): void {
    if (this.sendFormResponce) {
      this.timer(this.sendFormResponce.retryDelay)
    }
console.log(this.senderInfo,"sender");


    setTimeout(() => {
      if (this.codeInputField !== undefined) {
        this.codeInputField.nativeElement.focus();
      }
    }, 500);
  }

  public backToRegistration(): void {    
    this.backto = true;
    this.backToReg.emit(this.backto);

  }

  timer(secconds: number) {
    const source = timer(1000, 2000);
    source.pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(val => {
      if (val <= secconds) {
        this.subscribeTimer = secconds - val;
      }
    });
  }

  onPaste(event: any) {
    let copyPaste = (event as ClipboardEvent).clipboardData.getData('text');
    if (copyPaste.length === 4 && isNaN(copyPaste as any) === false) {
      this.sendCode.emit(this.authentificatedService.confirmValue)
    }
  }

  codeInput(event) {
    let code = (event as KeyboardEvent).keyCode;
    let codes = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 9, 8];
    if (codes.filter(cod => cod == code).length == 0) {
      if (event.ctrlKey == false || (event.ctrlKey == true && event.keyCode == 86)) {
        event.preventDefault();
        event.stopPropagation();
      }
      return
    }
  }

  focusInput(event) {
    if (event.target.tagName === "SPAN") {
      event.target.parentElement.nextElementSibling.focus();
    } else {
      event.target.nextElementSibling.focus();
    }
  }

  codeKeyUp() {
    if (this.authentificatedService.confirmValue.length === 4) {
      this.sendCode.emit(this.authentificatedService.confirmValue);
    }
  }

  resendUserData() {
    
    this.resendCode.emit(this.senderInfo);
    this.timer(this.sendFormResponce.retryDelay);
    this.authentificatedService.confirmValue = "";
    this.codeInputField.nativeElement.focus();
  }

  ngOnDestroy() {
    this.authentificatedService.confirmValue = "";
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }

}

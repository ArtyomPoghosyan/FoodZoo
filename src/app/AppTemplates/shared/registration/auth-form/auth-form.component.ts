import { AfterContentChecked, AfterViewChecked, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, AfterViewInit, AfterContentInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthFormComponent implements OnInit{

  public checkers: boolean = false;
  public isShowRobot: boolean = true;

  @Output() isShowRobotEmit: EventEmitter<Boolean> = new EventEmitter();
  @Input() selectedEvent:any;
  @Output() selectedPhone:EventEmitter<any> = new EventEmitter();
  @Input() eventUrl;
  @Input() captcha: boolean;
  @Input() url: string = "";
  @Output() requestOut: EventEmitter<{ url: string, value: string }> = new EventEmitter();
  @Output() skip: EventEmitter<boolean> = new EventEmitter();
  regPhone: boolean = true;
  checker: boolean = false;
  mask = ['+', '7', '(', /[0-9]/, /\d/, /\d/, ')', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];

  formPhone: FormGroup = new FormGroup({
    phone: new FormControl('', [Validators.required, Validators.minLength(16), Validators.pattern('^[\(\)a-z0-9-+]+$')])
  })
  formMail: FormGroup = new FormGroup({
    Email: new FormControl('', [Validators.email, Validators.required,
    Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)])
  })

  constructor(

  ) { }

  ngOnInit(): void { }

  returnValid(Form: FormGroup) {
    if (Form.pristine || Form.status === "INVALID") {
      return true;
    } else {
      return false;
    }
  }

  returnPosition(event: any) { 
  }

  

  public getCode(): void {
    this.isShowRobot = false;
    this.isShowRobotEmit.emit(this.isShowRobot)
    this.selectedEvent=this.formPhone.value.phone;      
  }

  submitMail(Form: FormGroup) {
    let url = "email";
    let value = Form.value.Email;
    this.requestOut.emit({ url, value })
    
  }

  submitPhone(Form: FormGroup) {
    let url = "phone";
    let value = Form.value.phone;
    this.requestOut.emit({ url, value })
  }

  returnError(control: FormControl) {
    if (control?.errors?.email && control?.touched) {
      return "Введите корректный E-mail";
    } else if (control?.errors?.required && control?.touched) {
      return "Поле обязательно для заполнения"
    } else if (control?.errors?.minlength && control?.touched) {
      return "Минимальное кол-во символов" + `${control.errors.minlength.requiredLength}`
    } else {
      return false
    }
  }
}

import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import { FormGroup, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { UtilitesService } from '../../../services/utilites.service';
import { RestApiService } from '../../../services/rest-api.service';
import {
    AuthService,
    FacebookLoginProvider,
    VkontakteLoginProvider
} from 'angular-6-social-login-v2';
import {NgbModal, NgbActiveModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {environment} from '../../../../environments/environment';

@Component({
    selector: 'app-registration-form-customer',
    templateUrl: './registration-form-customer.component.html',
    styleUrls: ['./registration-form-customer.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RegistrationFormCustomer implements OnInit {
    confirmPass: boolean = false;
    error_send: boolean = false;
    productForm: boolean = true;
    success_send: boolean = false;
    showPassword1: boolean = false;
    showPassword2: boolean = false;
    try_to_send: boolean = false;
    error_message: string;
    isLoading: boolean = true;
    validForm: boolean = false;
    closeResult: string;
    email: string;
    changedEmail: string;
    social_id: number;
    modalReference: any;
    modalRef: boolean = true;
    errorMsg: string;
    socialProvider: string;
    passwordConf: boolean;
    currentUrl: any = location.origin;
    formTitle: string;
    oneTime: boolean;
    fromProd: boolean;
    fromProdEmail: string;
    locData: any;
    okruClientId: string;

    registrationCustomer = new FormGroup({
        emailcust: new FormControl('', Validators.compose(
            [Validators.minLength(5), Validators.required, Validators.pattern('^([a-zA-Z0-9_-]+\.)*[a-zA-Z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$')])),
        passwordc: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
        passwordc2: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
    }, this.passwordMatchValidator);
    public validationErrors = {
        emailcust: {
            required: 'Введите верный Email',
            pattern: 'Введите верный Email',
            minlength: 'Введите верный Email'
        },
        passwordc: {
            required: 'Введите верный Пароль',
            minlength: 'Введите мин. 6 символов'
        }
    };

    get emailcust() { return this.registrationCustomer.get('emailcust'); }
    get passwordc() { return this.registrationCustomer.get('passwordc'); }
    get passwordc2() { return this.registrationCustomer.get('passwordc2'); }

    passwordMatchValidator(g: FormGroup) {
        return g.get('passwordc').value === g.get('passwordc2').value
            ? null : { confirmPass: false };
    }
    constructor(private _location?: Location,
                public utilitiesService?: UtilitesService,
                public rest?: RestApiService,
                public socialAuthService?: AuthService,
                public modalService?: NgbModal,
                private router?: Router,
                private activatedRoute?: ActivatedRoute
) {
        this.okruClientId = environment.OKRU_CLIENT_ID;
    }

    ngOnInit() {
        this.locData = localStorage.getItem('userData');
        if (localStorage.getItem('userData')) {
             this._location.back();
             return;
        }
        this.onChangesForm();
        const params = window.location.href.split('=');
        this.rest.registrationCustomerWithOk(
            params[1],
            this.currentUrl + '/registration'
        ).subscribe(res => {
            if (!res.error) {
                this.social_id = res;
                this.socialProvider = 'ok';
                this.opens();
            }
        });
        /*this.activatedRoute.url.subscribe(params => {
            if (params[0].path === 'registration') {
                this.formTitle = 'Регистрация';
            } else {
                this.formTitle = 'Зарегистрироваться';
            }
            });*/
        this.activatedRoute.queryParams.subscribe(params => {
            const userId = params['step'];
            if (userId === 'false') {
                this.registrationCustomer.reset();
                this.try_to_send = false;
                this.success_send = false;
                this.fromProd = false;
            }
            if (userId === 'true') {
                this.fromProd = true;
                this.fromProdEmail = localStorage.getItem('registrationEmail');
            }
        });
    }
    public onkeyUpMethod(): any {
        if (this.registrationCustomer.value.passwordc && this.registrationCustomer.value.passwordc2 &&
            (this.registrationCustomer.value.passwordc !== this.registrationCustomer.value.passwordc2)) {
            this.passwordConf = true;
        } else {
            this.passwordConf = false;
        }
    }
    removeSpace(e) {
        const key = e.keyCode;
        if (key === 32) {
            e.preventDefault();
        }
    }

    opens() {
        const modalRef = this.modalService.open(NgbdModalContentComponent);
        if (this.success_send) {
            modalRef.close();
        }
    }

    open(content = null) {
        this.modalReference = this.modalService.open(content);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return  `with: ${reason}`;
        }
    }
    onChangesForm(): void {
        this.registrationCustomer.valueChanges.subscribe(val => {
            if (this.registrationCustomer.status == 'VALID') {
                this.validForm = true;
            } else {
                this.validForm = false;
            }
        });
    }
    register() {
        this.oneTime = true;
        if (this.registrationCustomer.status !== 'INVALID') {
            const queryParams: any = { step: true };
            this.rest.registrationCustomer(
                this.registrationCustomer.value.emailcust,
                this.registrationCustomer.value.passwordc,
                null,
                null,
            ).subscribe(res => {
                if (res['error'] === 1) {
                    this.errorMsg = res['message'];
                    this.success_send = false;
                    setTimeout( () => {
                        this.oneTime = false;
                        this.errorMsg = '';
                    },3500);
                    return;
                }
                if (res['error'] === 0) {
                    this.router.navigate(
                        ['/registration'],
                        {queryParams: queryParams});
                    this.oneTime = false;
                    this.success_send = true;
                }
                localStorage.setItem('registrationEmail', this.registrationCustomer.value.emailcust);
            }, err => {
                this.oneTime = false;
                this.error_send = true;
                this.error_message = err['error'][0]['message'];
                setTimeout(() => {
                    this.error_send = false;
                    this.resetAllControls(this.registrationCustomer);
                }, 5000);
            });
        } else {
            this.markFormGroupTouched(this.registrationCustomer);
        }
    }
    // mark form
    private markFormGroupTouched(formGroup: FormGroup) {
        (<any>Object).values(formGroup.controls).forEach(control => {
            control.markAsTouched();
            if (control.controls) {
                this.markFormGroupTouched(control);
            }
        });
    }
    // mark reset
    private resetAllControls(formGroup: FormGroup) {
        (<any>Object).values(formGroup.controls).forEach(control => {
            control.reset();
            if (control.controls) {
                this.resetAllControls(control);
            }
        });
    }

     setValidationError(controlName: string): string {
        let control: AbstractControl = this.registrationCustomer.get(controlName);
        if (control && control.errors) {
            let errorKeys = Object.keys(control.errors);
            if (errorKeys && errorKeys.length > 0) {
                return this.validationErrors[controlName][errorKeys[0]];
            }
        }
        return '';
    }

     socialSignIn(socialPlatform: string, socialModal: any) {
        let socialPlatformProvider;
        if (socialPlatform === 'facebook') {
            socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
        } else if (socialPlatform === 'vkontakte') {
            socialPlatformProvider = VkontakteLoginProvider.PROVIDER_ID;
        } else if (socialPlatform === 'ok') {
            window.open('http://www.odnoklassniki.ru/oauth/authorize?client_id='+this.okruClientId+'&scope=GET_EMAIL&response_type=code&redirect_uri=' + window.location.origin + '/registration&layout=m','_blank',"width=200,height=100");
        }
        this.socialAuthService.signIn(socialPlatformProvider).then(
            (userData) => {
                if (userData.provider === 'facebook') {
                    this.email = userData.email;
                    this.social_id = parseInt(userData.id, 10);
                    this.socialProvider = userData.provider;
                    this.open(socialModal);
                } else if (userData.provider === 'vkontakte') {
                    this.social_id = parseInt(userData.id, 10);
                    this.socialProvider = userData.provider;
                    this.open(socialModal);
                } else {
                    this.markFormGroupTouched(this.registrationCustomer);
                }
            }
        );
    }

     changeEmail(event): any {
        const value = event.target.value;
        if ((value).trim()) {
            this.changedEmail = event.target.value;
        } else {
            return;
        }
    }

     socialRegister(): any {
         this.oneTime = true;
         const queryParams: any = { step: true };
         this.rest.registrationCustomer(
            this.changedEmail ? this.changedEmail : this.email,
            null,
            this.social_id,
            this.socialProvider,
        ).subscribe(res => {
            if (res['error'] === 1) {
               this.errorMsg = res['message'];
               this.success_send = false;
               setTimeout( () => {
                    this.try_to_send = false;
                    this.registrationCustomer.reset();
                    this.oneTime = false;
                    this.errorMsg = '';
                },3500);
               return;
            }
            if (res['error'] === 0) {
                 this.success_send = true;
                /* this.router.navigate(
                     ['/registration'],
                     {queryParams: queryParams
                     });*/
             }
            localStorage.setItem('registrationEmail', this.email);
            setTimeout(() => {
                if (this.modalReference) {
                    this.modalReference.close();
                    this.oneTime = false;
                } else {
                    this.modalRef = false;
                }
            },1500);
        }, err => {
            this.error_send = true;
            this.oneTime = false;
            this.error_message = err['error'][0]['message'];
            setTimeout(() => {
                this.error_send = false;
                this.resetAllControls(this.registrationCustomer);
            }, 5000);
        });
    }

}

@Component({
    selector: 'app-ngbd-modal-content',
    templateUrl: './ngbd-modal-content.component.html',
    styleUrls: ['./registration-form-customer.component.scss']
})
export class NgbdModalContentComponent  extends RegistrationFormCustomer {
    @Input() name;
    constructor(public activeModal: NgbActiveModal,
                public utilitiesService: UtilitesService,
                public rest: RestApiService) {
        super();
    }
}

import {Component, OnInit, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import { RestApiService } from '../../services/rest-api.service';
import { FormControl, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { UtilitesService } from '../../services/utilites.service';
import { Router } from '@angular/router';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-update-password',
    templateUrl: './update-password.component.html',
    styleUrls: ['./update-password.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UpdatePasswordComponent implements OnInit {
    @ViewChild('modalChangePassword') private modalChangePassword;
    isLoading: boolean = false;
    successPassword: boolean = false;
    errorPassword: boolean = false;
    PasswordMessage: string|null = null;
    closeResult: string|null = null;
    modalReference: any = null;
    typeModal: number|null = null;
    passwordConf: boolean = false;
    oneTime: boolean = false;
    destroyStream$ : Subject<any> = new Subject();
    profileUserNewPasswordForm = new FormGroup({
        profileUserOldPass: new FormControl('', Validators.required),
        profileUserNewPass: new FormControl('', Validators.required),
        profileUserNewPassConf: new FormControl('', Validators.required),
    }, this.passwordMatchValidator);

    public validationErrors = {
        profileUserOldPass: {
            required: 'Необходимо заполнить «Старый пароль».'
        },
        profileUserNewPass: {
            required: 'Необходимо заполнить «Новый пароль».'
        }
    };

    passwordMatchValidator(g: FormGroup) {
        return g.get('profileUserNewPass').value === g.get('profileUserNewPassConf').value ? null : { 'confirmPass': false };
    }

    get profileUserOldPass() { return this.profileUserNewPasswordForm.get('profileUserOldPass'); }

    get profileUserNewPass() { return this.profileUserNewPasswordForm.get('profileUserNewPass'); }

    get profileUserNewPassConf() { return this.profileUserNewPasswordForm.get('profileUserNewPassConf'); }

    constructor(public rest: RestApiService,
                private utilitiesService: UtilitesService,
                private router: Router,
                private modalService: NgbModal) { }

    ngOnInit() {
        this.modalListener();
    }

    modalListener() {
        this.utilitiesService.ModalEvent.pipe(
            takeUntil(this.destroyStream$)
        ).subscribe(
            (type:number|null) => {
                this.typeModal = type;
                if (this.typeModal === 3) {
                    this.modalReference = this.modalService.open(this.modalChangePassword, { centered: true });
                }
            }, e => {}
        );
    }

    onkeyUpMethod(): any {
        if (this.profileUserNewPasswordForm.value.profileUserNewPass && this.profileUserNewPasswordForm.value.profileUserNewPassConf &&
            (this.profileUserNewPasswordForm.value.profileUserNewPass !== this.profileUserNewPasswordForm.value.profileUserNewPassConf)) {
            this.passwordConf = true;
        } else {
            this.passwordConf = false;
        }
    }

    open(content) {
        this.modalReference.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
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
            return `with: ${reason}`;
        }
    }

    pushUserNewPass() {
        this.oneTime = true;
        if (this.profileUserNewPasswordForm.status !== 'INVALID') {
            this.rest.updateUserPassword(
                this.profileUserNewPasswordForm.value.profileUserOldPass,
                this.profileUserNewPasswordForm.value.profileUserNewPass,
            ).pipe(
                takeUntil(this.destroyStream$)
            ).subscribe(res => {
                this.oneTime = false;
                if (res['error'] === 0) {
                    this.successPassword = true;
                    this.utilitiesService.setNewUserName(res['name']);
                    this.resetAllControls(this.profileUserNewPasswordForm);
                    setTimeout(() => {
                        this.successPassword = false;
                        this.utilitiesService.checkAuthorization(false);
                        this.modalReference.close();
                        this.router.navigate(['/login']);
                    }, 4000);
                } else {
                    this.errorPassword = true;
                    setTimeout(() => {
                        this.errorPassword = false;
                    }, 4000);
                }
                this.PasswordMessage = res['message'];
            }, err => {
                this.errorPassword = true;
                this.PasswordMessage = err['message'];
                setTimeout(() => {
                    this.errorPassword = false;
                }, 4000);
            });
        } else {
            this.markFormGroupTouched(this.profileUserNewPasswordForm);
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

    public setValidationError(controlName: string): string {
        let control: AbstractControl = this.profileUserNewPasswordForm.get(controlName);
        if((control && control.errors) && (Object.keys(control.errors) && Object.keys(control.errors).length > 0)){
            return this.validationErrors[controlName][Object.keys(control.errors)[0]];
        } else {
            return '';
        }
    }

    checkIfIsLoading() {
        setTimeout(() => {
            this.isLoading = false;
        }, 1000);
    }

    ngOnDestroy() {
        this.destroyStream$.next(null);
        this.destroyStream$.complete();
    }
}

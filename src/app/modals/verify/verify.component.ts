import {Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {UtilitesService} from '../../services/utilites.service';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subject, Subscription} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VerifyComponent implements OnInit, OnDestroy {
  @ViewChild('modalVerifyPhonePassword') private modalVerifyPhonePassword;
  
  @Input() error: string;
  @Input() success: number;
  @Input() errorMatch: string;
  @Input() closeModal: boolean;
  @Input() isLoading: boolean;

  modalReference: any = null;
  typeModal: number|null = null;
  closeResult: string|null = null;
  verifyPhoneNumber: FormGroup|null = null;
  oneTime: boolean = false;
  seconds: any = null;
  time: any = null;
  timeStatus: any = null;
  submitted:boolean = false;
  destroyStream$: Subject<any> = new Subject();

  constructor(private utilitiesService: UtilitesService,
              private router: Router,
              private modalService: NgbModal) { }

  ngOnInit() {
    console.log("helllooooo")
    this.seconds = 60;
    this.verifyPhoneNumber = new FormGroup({
        verifyCode: new FormControl(null, [
                Validators.required,
                Validators.pattern('[\(\)0-9-+]*'),
                Validators.minLength(4),
                Validators.maxLength(4),
        ]),
    });
    this.modalListener();
    this.utilitiesService.sendTimeStatusEvent.pipe(
        takeUntil(this.destroyStream$)
    ).subscribe((bool) => {
         this.timeStatus = bool;
         if (this.timeStatus) {
           this.timer();
        }
     }, e=>{});
    this.utilitiesService.closeModalEvent.pipe(
        takeUntil(this.destroyStream$)
    ).subscribe((bool: boolean) => {
        this.isLoading = bool;
        if (bool) {
            this.modalReference.close();
        }
     }, e=>{});
  }

    get verifyCode() { 
        return this.verifyPhoneNumber.get('verifyCode'); 
    }


    modalListener() {
      this.utilitiesService.ModalEvent.pipe(
          takeUntil(this.destroyStream$)
      ).subscribe(
        (type:number|null) => {
          this.typeModal = type;
          if (this.typeModal === 4) {
            this.isLoading = false;
            this.modalReference = this.modalService.open(this.modalVerifyPhonePassword, { centered: true });
          }
        }, e=>{}
      );
  }

  timer() {
      this.time = setInterval(() => {
          this.seconds--;
      }, 1000);
      setInterval(() => {
          if (this.seconds <= 0) {
              clearInterval(this.time);
          }
      }, 1000);
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

    closed() {
      this.submitted = false;
      this.verifyPhoneNumber.reset();
      clearInterval(this.time);
      this.seconds = 60;
    }

    valHide() {
        this.submitted = false;
    }

    sendCodeAgain() {
      this.seconds = 60;
      this.timer();
      this.errorMatch = '';
      this.isLoading = false;
      this.utilitiesService.sendAgain(true);
    }

    verification() {
      if (this.verifyPhoneNumber.valid) {
          this.isLoading = true;
          this.oneTime = true;
          this.utilitiesService.sendCode(this.verifyCode.value);
      } else {
          this.oneTime = false;
          this.submitted = true;
          return;
      }
    }

    ngOnDestroy() {
        this.destroyStream$.next(null);
        this.destroyStream$.complete();
    }


}

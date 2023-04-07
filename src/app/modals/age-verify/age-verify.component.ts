import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {UtilitesService} from '../../services/utilites.service';
import { AppSessionStorageService } from '../../AppTemplates/services/storages/app-session-storage.service';
import {CookieService} from 'ngx-cookie';
import {Subject, Subscription} from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-age-verify',
  templateUrl: './age-verify.component.html',
  styleUrls: ['./age-verify.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AgeVerifyComponent implements OnInit, OnDestroy  {
  @ViewChild('modalVerifyAge') public modalVerifyAge;
  modalReference: any = null;
  closeResult: string|null = null;
  typeModal: number|null = null;
  confirmAge: number|null = null;
  destroyStream$: Subject<any> = new Subject();

  sub: Subscription;
  constructor(private utilitiesService: UtilitesService,
              private modalService: NgbModal,
              public sessionStorage: AppSessionStorageService,
              public cookie: CookieService) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.modalListener();
    }, 200);
    this.utilitiesService.checkModalEvent.pipe(
      takeUntil(this.destroyStream$)
    ).subscribe((st) => {
      if (st) {
        this.modalListener();
      }
    });
  }

  modalListener() {
    this.modalReference = this.modalService.open(this.modalVerifyAge, { centered: true });
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

  verifyUserAge(status: number) {
    this.confirmAge = status;
    if (this.confirmAge) {
      this.utilitiesService.ageConfirm(true);
      this.cookie.put('ageConfirm', String(this.confirmAge), {expires: new Date(new Date().setHours(new Date().getHours() + 1))});
      this.modalReference.close();
    } else {
      this.utilitiesService.ageConfirm(false);
      this.cookie.put('ageConfirm', String(this.confirmAge));
      this.modalReference.close();
    }
  }

  ngOnDestroy() {
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }
}

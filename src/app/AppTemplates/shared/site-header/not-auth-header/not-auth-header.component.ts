import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { HelperServiceService } from '../../../services/helpers/helper-service.service';
import { RegistrationComponent } from '../../registration/registration.component';

@Component({
  selector: 'app-not-auth-header',
  templateUrl: './not-auth-header.component.html',
  styleUrls: ['./not-auth-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotAuthHeaderComponent implements OnInit {
  
  @Input() burgerOpen:boolean = false;
  @Input() totalCart:number = 0;
  @Input() queryParams:any = null;
  @Output() openBurger: EventEmitter<boolean> = new EventEmitter();
  @Output() backClicked: EventEmitter<boolean> = new EventEmitter();
  @Output() login: EventEmitter<boolean> = new EventEmitter();

  subHeaderOpened: boolean = false;

  constructor(
    public helperService: HelperServiceService
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
    this.helperService._open(RegistrationComponent);
  }

}

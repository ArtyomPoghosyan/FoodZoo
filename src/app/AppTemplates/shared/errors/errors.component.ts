import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { ErrorsService, ERRORSTYPES, Error } from './service/errors.service';

@Component({
  selector: 'app-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ErrorsComponent implements OnInit {

  type = ERRORSTYPES

  constructor(
    public errorsService : ErrorsService,
    public router: Router
  ) { }

  ngOnInit(): void {
  }

}


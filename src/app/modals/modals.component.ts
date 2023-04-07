import {ViewEncapsulation} from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalsComponent implements OnInit {
  constructor() { }
  ngOnInit() {
  }
}

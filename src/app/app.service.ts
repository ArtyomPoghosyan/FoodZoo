import { BehaviorSubject } from 'rxjs';
import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';


@Injectable()
export class AppService {
    public productList: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);

}
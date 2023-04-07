import { Component, ContentChild, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription, timer } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { ClosedApiService } from '../../../../AppTemplates/services/Portal/closed-api.service';
import { USER } from '../../../../AppTemplates/models/profile.models';
import { EDITMODE } from '../profile.component';
import { AppLocalStorageService } from '../../../../AppTemplates/services/storages/app-local-storage.service';
import { ErrorsService, ERRORSTYPES, Error } from '../../../../AppTemplates/shared/errors/service/errors.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSessionStorageService } from '../../../../AppTemplates/services/storages/app-session-storage.service';
import { HelperServiceService } from '../../../../AppTemplates/services/helpers/helper-service.service';
import { Router } from '@angular/router';
import { ProfileHelper } from '../service/helper.service';

declare var ymaps: any;

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditProfileModalComponent implements OnInit {

  @Input() editMode?: EDITMODE;
  @Input() UserData: USER;
  @Input() EDITmode;
  @Output() closeModal: EventEmitter<boolean> = new EventEmitter();
  @Output() emitCurrentPlaceLocation: EventEmitter<any> = new EventEmitter();

  public isShow = true;


  checker: boolean = false;
  mask = ['+', '7', '(', /[0-9]/, /\d/, /\d/, ')', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];
  showMask: boolean = false;
  codeMask = [/\d/, /\d/, /\d/, /\d/]
  value = ""
  showConfirm: boolean = false;
  editForm: FormGroup = new FormGroup({
    value: new FormControl('', [])
  })

  subscribeTimer: number = 60;
  destroyStream$ = new Subject();
  sendParams?: { type: string, value: string };
  eMessage?: string;

  myPlacemark;
  currentPlaceLocation;
  searchData;
  coordinates;
  myMap;
  mySearchControl;

  @ViewChild('codeInputField') codeInputField: ElementRef;

  constructor(
    private closedApi: ClosedApiService,
    private localStorage: AppLocalStorageService,
    private sessionStorage: AppSessionStorageService,
    private errorsService: ErrorsService,
    private helperService: HelperServiceService,
    private router: Router,
    private profileHelper: ProfileHelper,
    private _ngZone: NgZone
  ) {
    this._initMap = this._initMap.bind(this);
  }

  ngOnInit(): void {

    if (this.editMode === EDITMODE.PHONE) {
      this.editForm = new FormGroup({
        value: new FormControl('', [Validators.required, Validators.pattern('^[\(\)a-z0-9-+]+$')])
      })
      this.sendParams = { type: 'phone', value: this.editForm.value.value }
    } else if (this.editMode === EDITMODE.E_MAIL) {
      this.editForm = new FormGroup({
        value: new FormControl('', [Validators.required, Validators.email])
      })
      this.sendParams = { type: 'email', value: this.editForm.value.value }
    }
    ymaps.ready(this._initMap);
  }

  private _setCurrentAddressMarker(): void {


    const { profile } = this.UserData;
    const { position } = profile;

    this.coordinates = [position.latitude, position.longitude];

    this._addMarker(position);

  }

  private _updateUserCoordinates(): void {
    const userData = (JSON.parse(this.localStorage.getItem('UData')) as USER);
    const [latitude, longitude] = this.coordinates;
    userData.profile.position = { latitude, longitude };
    this.localStorage.setItem('UData', JSON.stringify(userData));
  }

  private _addMarker(coordinates: { latitude: number, longitude: number }): void {
    const { latitude, longitude } = coordinates;
    this.coordinates = [latitude, longitude]
    const coords = [latitude, longitude];

    if (this.myPlacemark) {
      this.myPlacemark.geometry.setCoordinates(coords);
    } else {
      this.myPlacemark = this._createPlacemark(coords);
      this.myMap.setCenter(coords);
      this.myMap.geoObjects.add(this.myPlacemark);
      this.myPlacemark.events.add('dragend', () => {
        this._getAddress(this.myPlacemark.geometry.getCoordinates());
      });
    }
    this._getAddress(coords);
  }

  public _initMap(): void {
    var mySearchResults;

    this.myMap = new ymaps.Map('information_map', {
      center: [45.52662507204429, 33.05727366406248],
      // center: this.coordinates,
      zoom: 9,
    });

    this.myMap.controls.remove('geolocationControl');
    this.myMap.controls.remove('searchControl');
    this.myMap.controls.remove('trafficControl');
    this.myMap.controls.remove('typeSelector');
    this.myMap.controls.remove('fullscreenControl');
    this.myMap.controls.remove('zoomControl');
    this.myMap.controls.remove('rulerControl');


    var myButton = new ymaps.control.Button({
      data: {
        image: 'none',
        content: 'Это мой адрес',
        title: 'Click to save the route',
      },
      options: {
        layout: ymaps.templateLayoutFactory.createClass(
          "<div class='myButton {% if state.selected %}myButtonSelected{% endif %}' title='{{ data.title }}'>" +
          "{{ data.content }}" +
          "</div>"
        ),
        maxWidth: [30, 100, 250],
      }
    });
    if (this.UserData.profile.position && Object.keys(this.UserData.profile?.position).length > 0) {
      this._setCurrentAddressMarker();
    }

    myButton.events.add('press', () => {
      setLocation();
    })
    const setLocation = () => {

      if (this.currentPlaceLocation && this.coordinates) {
        this.userAddressPost()
          .subscribe(() => {
            this._ngZone.run(() => {
              this.closeModal.emit(true)
            })
          })
      }
      else {
        this.localStorage.setItem('Address', "")
        this._ngZone.run(() => {
          this.closeModal.emit(true)
        })
      }

    }
    this.myMap.controls.add(myButton, {
      maxWidth: [30, 100, 250],
      position: { left: 450, top: 450 },
    });

    // get current location 

    var geolocationControl = new ymaps.control.GeolocationControl({
      data: { content: 'Определить местоположение', image: 'none' },
      options: { noPlacemark: true, maxWidth: [30, 100, 250], position: { left: 150, top: 450 } }
    });
    this.myMap.controls.add(geolocationControl);
    geolocationControl.events.add('locationchange', (e) => {
      const [latitude, longitude] = e.get('position');
      this._addMarker({ latitude, longitude });
      this.myMap.panTo([latitude, longitude]);
    });
    this.mySearchControl = new ymaps.control.SearchControl({
      options: {
        noPlacemark: true,
      }
    }),
      mySearchResults = new ymaps.GeoObjectCollection(null, {
        hintContentLayout: ymaps.templateLayoutFactory.createClass('$[properties.name]')
      });
    this.myMap.controls.add(this.mySearchControl);
    this.myMap.geoObjects.add(mySearchResults);
    mySearchResults.events.add('click', (e) => {
      e.get('target').options.set('preset', 'islands#redIcon');
      const [latitude, longitude] = e.get('coords');
      this._addMarker({ latitude, longitude });
    });
    this.mySearchControl.events.add('resultselect', (e) => {
      this.searchData = e.get('target')['_yandexState']['_model']['request'];
      let getlocationforSearchinput = e.get('target')['state']['_data']['inputValue'];

      getSearchResult();
      var index = e.get('index');
      this.mySearchControl.getResult(index).then((res) => {
        var searchCoords = res.geometry['_coordinates'];
        // mySearchResults.add(this._placemark(searchCoords));
        this._addMarker({ latitude: searchCoords[0], longitude: searchCoords[1] })
      });
    }).add('submit', () => {
      mySearchResults.removeAll();
    })

    const getSearchResult = () => {
      if (this.searchData) {
        this.profileHelper.AddressState.next(this.searchData);
        this.localStorage.setItem('Address', this.searchData);
      }
    }

    this.myMap.events.add('click', (e) => {
      const [latitude, longitude] = e.get('coords');
      this._addMarker({ latitude, longitude })
    });
  }

  private _createPlacemark(coords) {
    return this._placemark(coords)
  }

  private _placemark(coords) {
    var placemark = new ymaps.Placemark(coords, {
      iconCaption: 'searching...'
    }, {
      draggable: true,
      iconLayout: 'default#imageWithContent',
      iconImageHref: './assets/images/placemark.png',
      iconImageSize: [42, 54],
      iconImageOffset: [-20, -50,],
      iconContentOffset: [15, 15],
    })
    return placemark;
  }

  private _getAddress(coords) {
    this.myPlacemark.properties.set('iconCaption', 'searching...');
    let coo = this.localStorage.setItem("Coo", coords)
    ymaps.geocode(coords).then((res) => {

      var firstGeoObject = res.geoObjects.get(0);
      this.currentPlaceLocation = firstGeoObject.getAddressLine();
      this.mySearchControl.options.set("placeholderContent", this.currentPlaceLocation)
      this.myPlacemark.properties
        .set({

          iconCaption: [
            firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
            firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
          ].filter(Boolean).join(', '),
          balloonContent: firstGeoObject.getAddressLine()
        });
    });
  }

  public userAddressPost() {

    const getCurrentLocation = this.currentPlaceLocation;
    let coordinates = this.coordinates;
    let selectedPLaceData = getCurrentLocation.split(",");
    let country = selectedPLaceData[0].trim();
    let province = selectedPLaceData[1].trim();
    let locality = selectedPLaceData[selectedPLaceData.length - 3].trim();
    let street = selectedPLaceData[selectedPLaceData.length - 2].trim();
    let house = selectedPLaceData[selectedPLaceData.length - 1].trim();
    let addressInfo = (`${province},${street},${house}`)
    const body = {
      "latitude": coordinates[0],
      "longitude": coordinates[1],
      "full_address": getCurrentLocation,
      "address_components": [
        {
          "kind": "country",
          "name": country
        },
        {
          "kind": "province",
          "name": "Южный федеральный округ"
        },
        {
          "kind": "province",
          "name": province,
        },
        {
          "kind": "locality",
          "name": province,
        },
        {
          "kind": "street",
          "name": street
        },
        {
          "kind": "house",
          "name": house
        }
      ]
    }
    return this.closedApi.setLocation(body)
      .pipe(
        map((dt: any) => {
          if (!dt.error) {
            this.localStorage.setItem('Address', this.currentPlaceLocation);
            this.profileHelper.AddressState.next(addressInfo);
            this._updateUserCoordinates();
          } else {
            alert(dt.message);
            throw (dt);
          }
        })
      )
  }

  getValidatorErrors() {
    let control = this.editForm.get('value');
    if (control.hasError('required') && control.touched) {
      return "Поле обязательно для заполнения!";
    } else if (control.hasError('email') && control.touched) {
      return 'Укажите корректный E-mail!';
    } else if (control.hasError('pattern') && control.touched) {
      return 'Укажите корректное значение!';
    } else if (control.hasError('pattern') && this.editMode === EDITMODE.PHONE && control.touched) {
      return 'Укажите корректный номер телефона!'
    } else if (this.editForm.value.value.trim() === "" && control.touched) {
      return "Имя не может состоять из одних пробелов!"
    } else {
      return false;
    }
  }

  getCode() {
    this.sendParams.value = this.editForm.value.value.trim();
    this.subscribeTimer = 60;
    if (this.editMode !== EDITMODE.NAME) {
      this.codeEdit(this.sendParams);
    }
    this.timer(60);
  }

  codeEdit(params: { type: string, value: string }) {
    this.closedApi.sendCode(params).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      (r:any) => {
        if (r.error === 0) {
          this.showConfirm = true;
          this.timer(r.retryDelay);
          setTimeout(() => {
            if (this.codeInputField !== undefined) {
              this.codeInputField.nativeElement.focus();
            }
          }, 500);
        } else {
          let id = 0;
          if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
            id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
          }
          let error: Error = {
            errorMessage: r.message,
            errorType: ERRORSTYPES.DEFAULT,
            errorCode: r.error,
            errorID: id
          }
          this.errorsService.setErrors(error);
        }
      },
      (e: HttpErrorResponse) => {
        let id = 0;
        if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
          id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
        }
        let error: Error = {
          errorMessage: e.error.message,
          errorType: ERRORSTYPES.DEFAULT,
          errorCode: e.status,
          errorID: id
        }
        this.errorsService.setErrors(error);
      }
    )
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
      let type = this.sendParams.type;
      let value = this.sendParams.value;
      let code = this.value;
      this.sendCode(type, value, code)
    }
  }

  sendCode(type, value, code) {
    this.closedApi.codeVerificate(type, value, code).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r => {
        if (r.error === 0) {
          this.profileUpdate(JSON.parse(this.localStorage.getItem('UData')), r);
          this.closeModal.emit(true);
        } else {
          this.eMessage = r.message;
          let id = 0;
          if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
            id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
          }
          let error: Error = {
            errorMessage: r.message,
            errorType: ERRORSTYPES.DEFAULT,
            errorCode: r.error,
            errorID: id
          }
          this.errorsService.setErrors(error);
        }
      },
      (e: HttpErrorResponse) => {
        let id = 0;
        if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
          id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
        }
        let error: Error = {
          errorMessage: e.error.message,
          errorType: ERRORSTYPES.DEFAULT,
          errorCode: e.status,
          errorID: id
        }
        this.errorsService.setErrors(error);
      }
    )
  }

  profileUpdate(prevData: USER, newData: USER) {
    newData.profile.cartAmount = newData.profile.cartAmount + prevData.profile.cartAmount;
    prevData = newData;
    this.localStorage.setItem('UData', JSON.stringify(prevData));
  }

  setError(r: any, e?: HttpErrorResponse) {
    let id = 0;
    if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
      id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
    }
    if (e) {
      let error: Error = {
        errorMessage: e.error.message,
        errorType: ERRORSTYPES.DEFAULT,
        errorCode: e.status,
        errorID: id
      }
      this.errorsService.setErrors(error);
    } else {
      let error: Error = {
        errorMessage: r.message,
        errorType: ERRORSTYPES.DEFAULT,
        errorCode: r.error,
        errorID: id
      }
      this.errorsService.setErrors(error);
    }
  }

  ngOnDestroy() {
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }

  focusInput(event) {
    if (event.target.tagName === "SPAN") {
      event.target.parentElement.nextElementSibling.focus();
    } else {
      event.target.nextElementSibling.focus();
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

  codeKeyUp() {
    if (this.value.length === 4 && this.errorsService.errorsArray.length === 0) {
      let type = this.sendParams.type;
      let value = this.sendParams.value;
      let code = this.value
      this.sendCode(type, value, code)
    }
  }

}

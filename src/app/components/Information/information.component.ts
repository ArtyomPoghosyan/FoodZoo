import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { UtilitesService } from '../../services/utilites.service';
import { NgAnimateScrollService } from 'ng-animate-scroll';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { RestApiService } from '../../services/rest-api.service';
import { Title, Meta } from '@angular/platform-browser';
import { takeUntil } from 'rxjs/operators';

declare var ymaps: any;

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InformationComponent implements OnInit, OnDestroy {
  private _map: any = null;
  num: any = 1;
  destroyStream$: Subject<any> = new Subject();

  private _subscription: Subscription = new Subscription();

  constructor(
    private utilitiesService: UtilitesService,
    private _animateScrollService: NgAnimateScrollService,
    private _activatedRoute: ActivatedRoute,
    public rest: RestApiService,
    private titleService: Title,
    private metaService: Meta
  ) {
  }

  ngOnInit() {
    setTimeout(() => {
      this.getSeo('about');
    }, 500);
    this.setAllStates();
    setTimeout(() => {
      this._initMap();
    }, 500);
    this._checkQueryParams();
  }

  setAllStates() {
    this.utilitiesService.downloadProducts(false);
    this.utilitiesService.headerState2(false);
    this.utilitiesService.hiddenFooter(false);
  }

  public onClickNext(elementId: string, duration: number = 400): void {
    this._animateScrollService.scrollToElement(elementId, duration);
  }

  getSeo(seoPageName) {
    this.rest.getSeoProperties(seoPageName).then((seoProp) => {
      if (seoProp['error'] === 0) {
        this.titleService.setTitle(seoProp['seo']['title']);
        this.metaService.updateTag({ name: 'description', content: seoProp['seo']['description'] });
        this.metaService.updateTag({ name: 'keywords', content: seoProp['seo']['keywords'] });
      }
    }, e => { });
  }

  private _initMap(): void {
    var myPlacemark,
      myMap = new ymaps.Map('information_map', {
        center: [45.52662507204429, 33.05727366406248],
        zoom: 9,
      }, {
        searchControlProvider: 'yandex#search'
      });

      myMap.controls.remove('geolocationControl'); 
      myMap.controls.remove('searchControl'); 
      myMap.controls.remove('trafficControl');
      myMap.controls.remove('typeSelector'); 
      myMap.controls.remove('fullscreenControl'); 
      myMap.controls.remove('zoomControl'); 
      myMap.controls.remove('rulerControl'); 

    myMap.events.add('click', function (e) {
      var coords = e.get('coords');

      if (myPlacemark) {
        myPlacemark.geometry.setCoordinates(coords);
      } else {
        myPlacemark = createPlacemark(coords);
        myMap.geoObjects.add(myPlacemark);

        myPlacemark.events.add('dragend', function () {
          getAddress(myPlacemark.geometry.getCoordinates());
        });
      }
      getAddress(coords);
      console.log(coords, "coords");

    });

    function createPlacemark(coords) {
      return new ymaps.Placemark(coords, {
        iconCaption: 'searching...'
      }, {
        preset: 'islands#violetDotIconWithCaption',
        draggable: true
      });
    }

    function getAddress(coords) {
      myPlacemark.properties.set('iconCaption', 'searching...');
      ymaps.geocode(coords).then(function (res) {
        var firstGeoObject = res.geoObjects.get(0);
        console.log(firstGeoObject.getAddressLine());

        myPlacemark.properties
          .set({
            iconCaption: [
              firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
              firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
            ].filter(Boolean).join(', '),
            balloonContent: firstGeoObject.getAddressLine()
          });
      });
      console.log(coords,"coords");
      
    }
  }

  _checkQueryParams(): void {
    this._activatedRoute.queryParams.pipe(
      takeUntil(this.destroyStream$)
    ).subscribe((params) => {
      if (params && params.step && this.num === 1) {
        setTimeout(() => {
          this.onClickNext(params.step);
        }, 0);
      } else {
        this.onClickNext(params.step);
      }
      this.num++;
    }, e => { });
  }

  ngOnDestroy() {
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }
}

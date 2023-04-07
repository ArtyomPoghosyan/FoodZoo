import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartPromocodeComponent } from './cart-promocode.component';

describe('CartPromocodeComponent', () => {
  let component: CartPromocodeComponent;
  let fixture: ComponentFixture<CartPromocodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartPromocodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartPromocodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersHistoryProductComponent } from './orders-history-product.component';

describe('OrdersHistoryProductComponent', () => {
  let component: OrdersHistoryProductComponent;
  let fixture: ComponentFixture<OrdersHistoryProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdersHistoryProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersHistoryProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

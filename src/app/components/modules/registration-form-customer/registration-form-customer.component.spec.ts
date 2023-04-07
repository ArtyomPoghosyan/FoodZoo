import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationFormCustomer } from './registration-form-customer.component';

describe('RegistrationFormCustomer', () => {
  let component: RegistrationFormCustomer;
  let fixture: ComponentFixture<RegistrationFormCustomer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrationFormCustomer ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationFormCustomer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

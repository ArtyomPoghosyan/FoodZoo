import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOrderProblemComponent } from './modal-order-problem.component';

describe('ModalOrderProblemComponent', () => {
  let component: ModalOrderProblemComponent;
  let fixture: ComponentFixture<ModalOrderProblemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalOrderProblemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalOrderProblemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

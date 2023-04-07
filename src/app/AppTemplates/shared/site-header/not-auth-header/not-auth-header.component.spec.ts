import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotAuthHeaderComponent } from './not-auth-header.component';

describe('NotAuthHeaderComponent', () => {
  let component: NotAuthHeaderComponent;
  let fixture: ComponentFixture<NotAuthHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotAuthHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotAuthHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

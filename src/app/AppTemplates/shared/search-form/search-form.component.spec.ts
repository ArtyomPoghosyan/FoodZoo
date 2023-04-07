import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SerachFormComponent } from './search-form.component';

describe('SerachFormComponent', () => {
  let component: SerachFormComponent;
  let fixture: ComponentFixture<SerachFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SerachFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SerachFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewQueryComponent } from './review-query.component';

describe('ReviewQueryComponent', () => {
  let component: ReviewQueryComponent;
  let fixture: ComponentFixture<ReviewQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

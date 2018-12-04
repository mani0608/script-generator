import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewConditionComponent } from './review-condition.component';

describe('ReviewConditionComponent', () => {
  let component: ReviewConditionComponent;
  let fixture: ComponentFixture<ReviewConditionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewConditionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

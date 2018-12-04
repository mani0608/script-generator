import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryCompareComponent } from './query-compare.component';

describe('QueryCompareComponent', () => {
  let component: QueryCompareComponent;
  let fixture: ComponentFixture<QueryCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryCompareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

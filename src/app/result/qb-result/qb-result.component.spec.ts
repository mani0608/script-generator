import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QbResultComponent } from './qb-result.component';

describe('ReviewScriptsComponent', () => {
  let component: QbResultComponent;
  let fixture: ComponentFixture<QbResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QbResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QbResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

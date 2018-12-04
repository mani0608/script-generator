import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingConfirmComponent } from './mapping-confirm.component';

describe('MappingConfirmComponent', () => {
  let component: MappingConfirmComponent;
  let fixture: ComponentFixture<MappingConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MappingConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

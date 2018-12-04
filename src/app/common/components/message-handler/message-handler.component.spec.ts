import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageHandlerComponent } from './message-handler.component';

describe('MessageHandlerComponent', () => {
  let component: MessageHandlerComponent;
  let fixture: ComponentFixture<MessageHandlerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageHandlerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

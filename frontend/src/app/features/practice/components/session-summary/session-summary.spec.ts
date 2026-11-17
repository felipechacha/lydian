import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionSummary } from './session-summary';

describe('SessionSummary', () => {
  let component: SessionSummary;
  let fixture: ComponentFixture<SessionSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

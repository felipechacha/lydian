import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionMetronome } from './session-metronome';

describe('SessionMetronome', () => {
  let component: SessionMetronome;
  let fixture: ComponentFixture<SessionMetronome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionMetronome],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionMetronome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

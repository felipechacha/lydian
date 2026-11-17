import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniMetronome } from './mini-metronome';

describe('MiniMetronome', () => {
  let component: MiniMetronome;
  let fixture: ComponentFixture<MiniMetronome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniMetronome],
    }).compileComponents();

    fixture = TestBed.createComponent(MiniMetronome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

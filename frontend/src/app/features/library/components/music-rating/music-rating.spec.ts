import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicRating } from './music-rating';

describe('MusicRating', () => {
  let component: MusicRating;
  let fixture: ComponentFixture<MusicRating>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicRating],
    }).compileComponents();

    fixture = TestBed.createComponent(MusicRating);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

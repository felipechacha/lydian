import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicTechniques } from './music-techniques';

describe('MusicTechniques', () => {
  let component: MusicTechniques;
  let fixture: ComponentFixture<MusicTechniques>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicTechniques],
    }).compileComponents();

    fixture = TestBed.createComponent(MusicTechniques);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

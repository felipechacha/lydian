import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetlistMusicPicker } from './setlist-music-picker';

describe('SetlistMusicPicker', () => {
  let component: SetlistMusicPicker;
  let fixture: ComponentFixture<SetlistMusicPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetlistMusicPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(SetlistMusicPicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

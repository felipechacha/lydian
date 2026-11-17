import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetlistTrackControls } from './setlist-track-controls';

describe('SetlistTrackControls', () => {
  let component: SetlistTrackControls;
  let fixture: ComponentFixture<SetlistTrackControls>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetlistTrackControls],
    }).compileComponents();

    fixture = TestBed.createComponent(SetlistTrackControls);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

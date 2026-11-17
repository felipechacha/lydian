import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetMusicPanel } from './sheet-music-panel';

describe('SheetMusicPanel', () => {
  let component: SheetMusicPanel;
  let fixture: ComponentFixture<SheetMusicPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SheetMusicPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(SheetMusicPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

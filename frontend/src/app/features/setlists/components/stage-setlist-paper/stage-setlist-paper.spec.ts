import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StageModeSetlist } from '../../models/stage-mode.models';
import { StageSetlistPaper } from './stage-setlist-paper';

const SETLIST_FIXTURE: StageModeSetlist = {
  id: 'setlist-1',
  title: 'Show de teste',
  context: 'Show',
  venue: 'Palco Central',
  eventDate: '24 ago · 18:30',
  duration: '14 min',
  tracks: [
    {
      musicId: 'music-10',
      orderLabel: '01',
      title: 'Primeira música',
      composer: 'Artista teste',
      bpm: 120,
      cue: 'Conta 4',
    },
  ],
};

describe('StageSetlistPaper', () => {
  let component: StageSetlistPaper;
  let fixture: ComponentFixture<StageSetlistPaper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StageSetlistPaper],
    }).compileComponents();

    fixture = TestBed.createComponent(StageSetlistPaper);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('setlist', SETLIST_FIXTURE);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the numbered track with stage metadata', () => {
    const paperText = fixture.nativeElement.textContent;

    expect(paperText).toContain('Show de teste');
    expect(paperText).toContain('01');
    expect(paperText).toContain('Primeira música');
    expect(paperText).toContain('120');
    expect(paperText).toContain('Conta 4');
  });

  it('should emit the selected track index', () => {
    const selectionSpy = vi.spyOn(component.trackSelected, 'emit');
    const trackButton = fixture.nativeElement.querySelector(
      '.track-select-custom',
    ) as HTMLButtonElement;

    trackButton.click();

    expect(selectionSpy).toHaveBeenCalledWith(0);
  });

  it('should identify played and current tracks through deterministic classes', () => {
    fixture.componentRef.setInput('playedMusicIds', new Set(['music-10']));
    fixture.detectChanges();

    expect(component.applyTrackClass(0, 'music-10')).toContain('stage-track-custom--current');
    expect(component.applyTrackClass(0, 'music-10')).toContain('stage-track-custom--played');
  });
});

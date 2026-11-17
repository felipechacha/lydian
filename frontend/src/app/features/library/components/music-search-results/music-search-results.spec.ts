import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppleMusicSearchResult } from '../../models/add-music.models';
import { MusicSearchResults } from './music-search-results';

describe('MusicSearchResults', () => {
  let component: MusicSearchResults;
  let fixture: ComponentFixture<MusicSearchResults>;
  const music: AppleMusicSearchResult = {
    id: 1571968519,
    title: 'Enter Sandman',
    artist: 'Metallica',
    album: 'Metallica (Remastered)',
    artworkUrl: 'https://images.example.com/enter-sandman.jpg',
    previewUrl: 'https://audio.example.com/enter-sandman.m4a',
    appleMusicUrl: 'https://music.apple.com/br/song/enter-sandman',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicSearchResults],
    }).compileComponents();

    fixture = TestBed.createComponent(MusicSearchResults);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('musics', [music]);
    fixture.componentRef.setInput('searchQuery', 'Metallica');
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('hasSearched', true);
    fixture.componentRef.setInput('searchErrorMessage', '');
    fixture.componentRef.setInput('previewErrorMessage', '');
    fixture.componentRef.setInput('selectedMusicId', music.id);
    fixture.componentRef.setInput('activePreviewMusicId', null);
    fixture.componentRef.setInput('previewProgressPercentage', 0);
    fixture.componentRef.setInput('previewRemainingSeconds', 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the music when its preview button is clicked', () => {
    let requestedMusic: AppleMusicSearchResult | undefined;
    component.previewToggled.subscribe((selectedMusic) => {
      requestedMusic = selectedMusic;
    });

    const previewButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.music-result-play-custom',
    );
    previewButton.click();

    expect(requestedMusic).toEqual(music);
  });

  it('should emit the music when its metadata is selected', () => {
    let selectedMusic: AppleMusicSearchResult | undefined;
    component.musicSelected.subscribe((musicResult) => {
      selectedMusic = musicResult;
    });

    const selectionButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.music-result-selection-custom',
    );
    selectionButton.click();

    expect(selectionButton.getAttribute('aria-pressed')).toBe('true');
    expect(selectedMusic).toEqual(music);
  });

  it('should render the playback progress around the active preview button', () => {
    fixture.componentRef.setInput('activePreviewMusicId', music.id);
    fixture.componentRef.setInput('previewProgressPercentage', 50);
    fixture.componentRef.setInput('previewRemainingSeconds', 15);
    fixture.detectChanges();

    const previewButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.music-result-play-custom',
    );

    expect(previewButton.style.getPropertyValue('--preview-progress')).toBe('50%');
    expect(previewButton.getAttribute('aria-label')).toContain('0:15 restantes');
    expect(previewButton.getAttribute('title')).toBe('0:15 restantes');
  });
});

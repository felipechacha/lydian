import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { SeoService } from '../../../../core/seo/seo.service';
import { SetlistService } from '../../data-access/setlist.service';
import { SetlistDetailDataResponse } from '../../models/setlist.models';
import { StageMode } from './stage-mode';

const SETLIST_RESPONSE: SetlistDetailDataResponse = {
  data: {
    id: 'setlist-1',
    user_id: 'user-1',
    name: 'Arena Rock — Set Principal',
    description: 'Show',
    visibility: 'private',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
    setlist_songs: [
      {
        id: 'relation-1',
        setlist_id: 'setlist-1',
        song_id: 'song-1',
        position: 0,
        notes: 'Conta 4',
        created_at: '2026-01-01T00:00:00Z',
        songs: {
          id: 'song-1',
          user_id: 'user-1',
          title: 'Master of Puppets',
          artist: 'Metallica',
          album: null,
          genre: null,
          musical_key: null,
          capo: null,
          tuning: null,
          bpm: 160,
          difficulty: 'advanced',
          spotify_track_id: null,
          spotify_preview_url: null,
          spotify_external_url: null,
          cover_image_url: null,
          notes: null,
          duration_seconds: 516,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
          deleted_at: null,
        },
      },
    ],
  },
};

describe('StageMode', () => {
  let component: StageMode;
  let fixture: ComponentFixture<StageMode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StageMode],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'setlist-1' } } },
        },
        {
          provide: SetlistService,
          useValue: { getSetlistDetails: vi.fn(() => of(SETLIST_RESPONSE)) },
        },
        { provide: SeoService, useValue: { updateSeo: vi.fn() } },
        { provide: ToastrNotificationService, useValue: { error: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StageMode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => expect(component).toBeTruthy());

  it('should keep every page section on the Bootstrap page grid', () => {
    const sections = fixture.nativeElement.querySelectorAll('#stage-mode-page > section');
    expect(sections.length).toBe(2);
    sections.forEach((section: HTMLElement) => {
      expect(section.querySelector('.container > .row > [class*="col-12"]')).toBeTruthy();
    });
    expect(fixture.nativeElement.querySelector('#stage-mode-page section section')).toBeNull();
  });

  it('should build the stage paper from the API setlist order', () => {
    expect(component.stageSetlist?.title).toBe('Arena Rock — Set Principal');
    expect(component.stageSetlist?.tracks).toHaveLength(1);
    expect(component.stageSetlist?.tracks[0].orderLabel).toBe('01');
    expect(component.stageSetlist?.tracks[0].bpm).toBe(160);
  });

  it('should toggle the played state of the current track', () => {
    const currentMusicId = component.stageSetlist?.tracks[0].musicId ?? '';
    component.toggleCurrentTrackPlayed();
    expect(component.playedMusicIds.has(currentMusicId)).toBe(true);
    component.toggleCurrentTrackPlayed();
    expect(component.playedMusicIds.has(currentMusicId)).toBe(false);
  });
});

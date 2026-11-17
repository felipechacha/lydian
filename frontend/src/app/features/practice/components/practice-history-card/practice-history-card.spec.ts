import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeHistoryCard } from './practice-history-card';
import { PracticeSessionHistoryItem } from '../../models/practice-session.models';

const ITEM = {
  sequence: 1,
  session: {
    id: 'session-1',
    user_id: 'user-1',
    title: 'Treino de riffs',
    started_at: '2026-01-01T10:00:00Z',
    ended_at: '2026-01-01T10:30:00Z',
    duration_minutes: 30,
    duration_seconds: 1800,
    paused_seconds: 0,
    notes: null,
    mood: 'focused',
    focus_area: 'Precisão',
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:30:00Z',
    practice_session_songs: [
      {
        id: 'entry-1',
        practice_session_id: 'session-1',
        song_id: 'song-1',
        minutes_practiced: 30,
        seconds_practiced: 1800,
        practiced_bpm: 120,
        notes: null,
        progress_rating: 4,
        repetitions: 5,
        quality_rating: 4,
        created_at: '2026-01-01T10:00:00Z',
        songs: { title: 'Song', artist: 'Artist', cover_image_url: null },
        practice_session_techniques: [],
      },
    ],
  },
} as unknown as PracticeSessionHistoryItem;

describe('PracticeHistoryCard', () => {
  let component: PracticeHistoryCard;
  let fixture: ComponentFixture<PracticeHistoryCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeHistoryCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PracticeHistoryCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', ITEM);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

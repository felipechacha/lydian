import { createPracticeSummary } from '../../../../../testing/practice-summary.fixture';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { AuthService } from '../../../../core/auth/auth.service';
import { PracticeSessionService } from '../../../practice/data-access/practice-session.service';
import { PracticeSummaryService } from '../../../profile/data-access/practice-summary.service';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let currentUserSubject: Subject<any>;
  let recentSessionsSubject: Subject<any>;
  let practiceSummarySubject: Subject<any>;
  let router: Router;

  beforeEach(async () => {
    currentUserSubject = new Subject<any>();
    recentSessionsSubject = new Subject<any>();
    practiceSummarySubject = new Subject<any>();

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => currentUserSubject.asObservable(),
          },
        },
        {
          provide: PracticeSessionService,
          useValue: {
            getRecentPracticeSessions: () => recentSessionsSubject.asObservable(),
          },
        },
        {
          provide: PracticeSummaryService,
          useValue: {
            getPracticeSummary: () => practiceSummarySubject.asObservable(),
          },
        },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compose every page section with the Bootstrap grid', () => {
    const loadingSections = fixture.nativeElement.querySelectorAll('#home-page > section');

    expect(loadingSections.length).toBe(1);
    expect(loadingSections[0].id).toBe('home-loading-section');

    loadingSections.forEach((section: HTMLElement) => {
      expect(section.querySelector('.container > .row > [class*="col-"]')).toBeTruthy();
    });

    completeDashboardRequests();
    fixture.detectChanges();

    const contentSections = fixture.nativeElement.querySelectorAll('#home-page > section');

    expect(contentSections.length).toBe(3);
    contentSections.forEach((section: HTMLElement) => {
      expect(section.querySelector('.container > .row > [class*="col-"]')).toBeTruthy();
    });
  });

  it('should keep page sections as semantic siblings', () => {
    expect(fixture.nativeElement.querySelector('#home-page section section')).toBeNull();
  });

  it('should show the skeleton until the current user request finishes', () => {
    expect(fixture.nativeElement.querySelector('app-content-skeleton-loading')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-daily-practice')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-next-practice-card')).toBeNull();
    expect(fixture.nativeElement.querySelector('.contextual-practice-button-custom')).toBeNull();

    completeDashboardRequests();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-content-skeleton-loading')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-daily-practice')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-next-practice-card')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.contextual-practice-button-custom')).toBeTruthy();
    expect(component.dailyPractice.userName).toBe('Felipe');
  });

  it('should use complete server aggregates even when the recent history is empty', () => {
    completeDashboardRequests();
    expect(component.dailyPractice.completedMinutes).toBe(90);
    expect(component.dailyPractice.remainingMinutes).toBe(0);
    expect(component.practiceStreak.days).toBe(3);
    expect(component.practiceStreak.week[0].completionPercentage).toBe(100);
    expect(component.weeklyPerformance.score).toBe(20);
    expect(component.weeklyPerformance.variation).toBe(-50);
    expect(component.weeklyPerformance.metrics[0].value).toBe('—');
    expect(component.recentSessions).toEqual([]);
  });

  it('should render recent completed sessions from the API', () => {
    currentUserSubject.next({ data: { display_name: 'Felipe' } });
    currentUserSubject.complete();
    practiceSummarySubject.next({ data: createPracticeSummary() });
    practiceSummarySubject.complete();
    recentSessionsSubject.next([
      {
        sequence: 8,
        session: {
          id: 'session-id',
          title: 'Treino de riffs',
          started_at: '2026-08-21T18:00:00.000Z',
          ended_at: '2026-08-21T18:24:00.000Z',
          duration_minutes: 24,
          duration_seconds: 1440,
          notes: 'Boa consistência.',
          mood: 'focused',
          focus_area: 'Palm mute',
          practice_session_songs: [
            {
              song_id: 'song-id',
              minutes_practiced: 24,
              seconds_practiced: 1440,
              progress_rating: 5,
              notes: 'Revisar o refrão.',
              songs: { title: 'Enter Sandman', artist: 'Metallica', bpm: 123 },
            },
          ],
        },
      },
    ]);
    recentSessionsSubject.complete();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.recent-session-item-custom')?.textContent,
    ).toContain('Enter Sandman');

    expect(fixture.nativeElement.querySelector('app-practice-diary-detail-modal')).toBeNull();

    fixture.nativeElement.querySelector('.recent-session-item-custom').click();

    expect(router.navigate).toHaveBeenCalledWith(['/music-details', 'song-id']);
  });

  function completeDashboardRequests(): void {
    currentUserSubject.next({ data: { display_name: 'Felipe' } });
    currentUserSubject.complete();
    practiceSummarySubject.next({ data: createPracticeSummary() });
    practiceSummarySubject.complete();
    recentSessionsSubject.next([]);
    recentSessionsSubject.complete();
  }
});

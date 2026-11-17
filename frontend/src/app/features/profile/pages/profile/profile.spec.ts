import { createPracticeSummary } from '../../../../../testing/practice-summary.fixture';
import { PracticeSummaryService } from '../../data-access/practice-summary.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { PracticeGoalService } from '../../data-access/practice-goal.service';
import { ProfileService } from '../../services/profile.service';
import { Profile } from './profile';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let profileRequest$: Subject<any>;
  let summaryRequest$: Subject<any>;
  let practiceGoalRequest$: Subject<any>;

  beforeEach(async () => {
    summaryRequest$ = new Subject<any>();
    profileRequest$ = new Subject<any>();
    practiceGoalRequest$ = new Subject<any>();

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        {
          provide: PracticeSummaryService,
          useValue: { getPracticeSummary: () => summaryRequest$.asObservable() },
        },
        {
          provide: ProfileService,
          useValue: {
            getProfile: () => profileRequest$.asObservable(),
          },
        },
        {
          provide: PracticeGoalService,
          useValue: {
            getPracticeGoal: () => practiceGoalRequest$.asObservable(),
            updatePracticeGoal: () => practiceGoalRequest$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the profile skeleton while the request is pending', () => {
    const sections = fixture.nativeElement.querySelectorAll('#profile-page > section');

    expect(sections.length).toBe(1);
    expect(fixture.nativeElement.querySelector('app-content-skeleton-loading')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#profile-identity-section')).toBeNull();
    expect(sections[0].querySelector('.container > .row > [class*="col-12"]')).toBeTruthy();
  });

  it('should show the complete profile after the request finishes', () => {
    completeProfileRequest();

    const sections = fixture.nativeElement.querySelectorAll('#profile-page > section');

    expect(sections.length).toBe(5);
    expect(component.stats.map((stat) => stat.value)).toEqual(['100', '3', '4']);
    expect(component.skills.find((skill) => skill.label === 'Ritmo')?.value).toBe(100);
    expect(component.trainingMetrics.map((metric) => metric.value)).toEqual([100, 20, 20]);
    expect(
      component.recentAchievements.slice(0, 3).every((achievement) => !achievement.isLocked),
    ).toBe(true);
    expect(fixture.nativeElement.querySelector('app-content-skeleton-loading')).toBeNull();

    sections.forEach((section: HTMLElement) => {
      expect(section.querySelector('.container > .row > [class*="col-12"]')).toBeTruthy();
    });
  });

  it('should keep profile sections as semantic siblings', () => {
    completeProfileRequest();

    expect(fixture.nativeElement.querySelector('#profile-page section section')).toBeNull();
  });

  function completeProfileRequest(): void {
    profileRequest$.next({
      data: {
        display_name: 'Felipe',
        id: 'user-id',
        email: 'felipe@example.com',
        main_instrument: 'Guitarra',
        created_at: '2026-08-01T00:00:00.000Z',
        experience_level: 'intermediate',
        avatar_url: 'https://images.example.com/avatar.jpg',
        updated_at: '2026-08-01T00:00:00.000Z',
      },
    });
    profileRequest$.complete();
    practiceGoalRequest$.next({
      data: {
        user_id: 'user-id',
        daily_target_seconds: 3600,
        weekly_target_days: 5,
        timezone: 'America/Sao_Paulo',
        created_at: null,
        updated_at: null,
      },
    });
    practiceGoalRequest$.complete();
    summaryRequest$.next({ data: createPracticeSummary() });
    summaryRequest$.complete();
    fixture.detectChanges();
  }
});

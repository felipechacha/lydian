import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { SeoService } from '../../../../core/seo/seo.service';
import { PracticeSessionService } from '../../data-access/practice-session.service';
import { PracticeHistoryDetail } from './practice-history-detail';

describe('PracticeHistoryDetail', () => {
  let component: PracticeHistoryDetail;
  let fixture: ComponentFixture<PracticeHistoryDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeHistoryDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'session-1' } } },
        },
        {
          provide: PracticeSessionService,
          useValue: {
            getPracticeSession: vi.fn(() =>
              of({
                data: {
                  id: 'session-1',
                  user_id: 'user-1',
                  title: 'Sessão',
                  started_at: '2026-01-01T10:00:00Z',
                  ended_at: '2026-01-01T10:30:00Z',
                  duration_minutes: 30,
                  duration_seconds: 1800,
                  paused_seconds: 0,
                  notes: null,
                  mood: null,
                  focus_area: null,
                  created_at: '2026-01-01T10:00:00Z',
                  updated_at: '2026-01-01T10:30:00Z',
                  practice_session_songs: [],
                },
              }),
            ),
          },
        },
        {
          provide: AuthService,
          useValue: { getCurrentUser: vi.fn(() => of({ data: { display_name: 'QA' } })) },
        },
        { provide: SeoService, useValue: { updateSeo: vi.fn() } },
        { provide: ToastrNotificationService, useValue: { error: vi.fn(), success: vi.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PracticeHistoryDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());
  it('should render API session metadata', () => {
    expect(fixture.nativeElement.querySelector('#practice-detail-title')?.textContent).toContain(
      'Sessão',
    );
    expect(component.duration).toBe('30m 00s');
  });
});

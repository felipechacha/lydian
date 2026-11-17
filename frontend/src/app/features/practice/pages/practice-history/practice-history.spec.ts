import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { SeoService } from '../../../../core/seo/seo.service';
import { LibraryService } from '../../../library/data-access/library.service';
import { PracticeSessionService } from '../../data-access/practice-session.service';
import { PracticeHistory } from './practice-history';

describe('PracticeHistory', () => {
  let component: PracticeHistory;
  let fixture: ComponentFixture<PracticeHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeHistory],
      providers: [
        provideRouter([]),
        {
          provide: PracticeSessionService,
          useValue: {
            getPracticeHistory: vi.fn(() =>
              of({ data: [], meta: { page: 1, limit: 10, total: 0 } }),
            ),
          },
        },
        {
          provide: LibraryService,
          useValue: {
            getMusicLibrary: vi.fn(() => of({ data: [], meta: { page: 1, limit: 100, total: 0 } })),
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
    fixture = TestBed.createComponent(PracticeHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should keep page sections on the Bootstrap grid', () => {
    const sections = fixture.nativeElement.querySelectorAll('#practice-history-page > section');
    expect(sections.length).toBe(3);
    sections.forEach((section: HTMLElement) => {
      expect(section.querySelector('.container > .row > [class*="col-12"]')).toBeTruthy();
    });
    expect(
      fixture.nativeElement.querySelector('#practice-history-page section section'),
    ).toBeNull();
  });
});

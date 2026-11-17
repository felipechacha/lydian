import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { PracticeGoalService } from './practice-goal.service';

describe('PracticeGoalService', () => {
  let service: PracticeGoalService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PracticeGoalService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get and update the authenticated user practice goal', () => {
    const apiUrl = `${environment.apiUrl}/me/practice-goal`;
    const payload = {
      daily_target_seconds: 3600,
      weekly_target_days: 5,
      timezone: 'America/Sao_Paulo',
    };

    service.getPracticeGoal().subscribe();
    service.updatePracticeGoal(payload).subscribe();

    const requests = httpTestingController.match(apiUrl);
    const getRequest = requests.find((request) => request.request.method === 'GET');
    const patchRequest = requests.find((request) => request.request.method === 'PATCH');
    expect(getRequest).toBeDefined();
    expect(patchRequest).toBeDefined();
    expect(patchRequest!.request.body).toEqual(payload);
    getRequest!.flush({
      data: { user_id: 'user-id', ...payload, created_at: null, updated_at: null },
    });
    patchRequest!.flush({
      data: { user_id: 'user-id', ...payload, created_at: null, updated_at: null },
    });
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { createPracticeSummary } from '../../../../testing/practice-summary.fixture';
import { PracticeSummaryService } from './practice-summary.service';

it('retrieves the server practice summary without paginating local history', () => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  const http = TestBed.inject(HttpTestingController);
  const summary = createPracticeSummary();
  TestBed.inject(PracticeSummaryService)
    .getPracticeSummary()
    .subscribe({ next: (response) => expect(response.data).toEqual(summary) });
  const request = http.expectOne(`${environment.apiUrl}/me/practice-summary`);
  expect(request.request.method).toBe('GET');
  request.flush({ data: summary });
  http.verify();
});

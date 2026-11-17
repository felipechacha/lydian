import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { TechniquesService } from './techniques.service';

describe('TechniquesService', () => {
  let service: TechniquesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TechniquesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should cache the complete active catalog', () => {
    const responses: unknown[] = [];
    service.getTechniques().subscribe((response) => responses.push(response));
    service.getTechniques().subscribe((response) => responses.push(response));

    const request = httpTestingController.expectOne(`${environment.apiUrl}/techniques`);
    request.flush({
      data: [
        {
          id: 'ff373eed-d5ff-49f0-a0e3-243783494f87',
          key: 'palm-mute',
          name: 'Palm Mute',
          category: 'articulation',
        },
      ],
    });

    expect(responses).toHaveLength(2);
  });

  it('should send trimmed optional filters without caching filtered results', () => {
    service.getTechniques({ category: ' articulation ', search: ' palm ' }).subscribe();

    const request = httpTestingController.expectOne(
      (httpRequest) => httpRequest.url === `${environment.apiUrl}/techniques`,
    );
    expect(request.request.params.get('category')).toBe('articulation');
    expect(request.request.params.get('search')).toBe('palm');
    request.flush({ data: [] });
  });
});

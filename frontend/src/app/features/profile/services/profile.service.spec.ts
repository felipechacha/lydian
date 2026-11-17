import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProfileService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('should use the supported profile GET and PATCH contracts', () => {
    const payload = { display_name: 'Felipe', main_instrument: 'Guitarra' };

    service.getProfile().subscribe();
    service.updateProfile(payload).subscribe();

    const [getRequest, updateRequest] = httpTestingController.match(`${environment.apiUrl}/me`);
    expect(getRequest.request.method).toBe('GET');
    expect(updateRequest.request.method).toBe('PATCH');
    expect(updateRequest.request.body).toEqual(payload);
    getRequest.flush({ data: {} });
    updateRequest.flush({ data: {} });
  });
});

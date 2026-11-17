import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { CreateSetlistRequest } from '../models/setlist.models';
import { SetlistService } from './setlist.service';

describe('SetlistService', () => {
  let service: SetlistService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SetlistService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should retrieve the paginated setlist collection', () => {
    service
      .getSetlists({
        page: 2,
        limit: 6,
        search: ' sábado ',
        sort_by: 'updated_at',
        sort_order: 'desc',
      })
      .subscribe((response) => {
        expect(response.data[0].name).toBe('Show de sábado');
        expect(response.meta).toEqual({ page: 2, limit: 6, total: 7 });
      });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/setlists?page=2&limit=6&sort_by=updated_at&sort_order=desc&search=s%C3%A1bado`,
    );
    expect(request.request.method).toBe('GET');

    request.flush({
      data: [createApiSetlist()],
      meta: { page: 2, limit: 6, total: 7 },
    });
  });

  it('should retrieve summaries without requesting individual details', () => {
    service.getSetlists().subscribe((response) => {
      expect(response.data[0].song_count).toBe(2);
      expect(response.data[0].missing_duration_count).toBe(1);
    });
    const request = httpTestingController.expectOne(`${environment.apiUrl}/setlists`);
    request.flush({
      data: [
        {
          ...createApiSetlist(),
          song_count: 2,
          duration_seconds: 300,
          missing_duration_count: 1,
          cover_image_urls: [],
        },
      ],
      meta: { page: 1, limit: 20, total: 1 },
    });
    httpTestingController.expectNone(`${environment.apiUrl}/setlists/${createApiSetlist().id}`);
  });

  it('should submit the complete order in one atomic request', () => {
    service.reorderSongs('setlist-id', ['second', 'first']).subscribe();
    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/setlists/setlist-id/songs/order`,
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ song_ids: ['second', 'first'] });
    request.flush({ data: { id: 'setlist-id' } });
  });

  it('should create a private setlist using the Swagger contract', () => {
    const payload: CreateSetlistRequest = {
      name: 'Show de sábado',
      description: 'Repertório principal.',
      visibility: 'private',
    };

    service.createSetlist(payload).subscribe((response) => {
      expect(response.data.name).toBe(payload.name);
      expect(response.data.visibility).toBe('private');
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/setlists`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({ data: createApiSetlist() });
  });

  it('should retrieve the setlist details and its ordered songs', () => {
    const setlistId = createApiSetlist().id;

    service.getSetlistDetails(setlistId).subscribe((response) => {
      expect(response.data.id).toBe(setlistId);
      expect(response.data.setlist_songs).toEqual([]);
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/setlists/${setlistId}`);
    expect(request.request.method).toBe('GET');
    request.flush({ data: { ...createApiSetlist(), setlist_songs: [] } });
  });

  it('should update the setlist metadata', () => {
    const setlistId = createApiSetlist().id;
    const payload = { name: 'Novo nome', visibility: 'public' as const };

    service.updateSetlist(setlistId, payload).subscribe((response) => {
      expect(response.data.name).toBe(payload.name);
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/setlists/${setlistId}`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: { ...createApiSetlist(), ...payload } });
  });

  it('should add a library song using the Swagger contract', () => {
    const setlistId = createApiSetlist().id;
    const payload = { song_id: '8ed56b8d-8ef9-4441-830a-9a3b4354e8c7' };

    service.addSong(setlistId, payload).subscribe((response) => {
      expect(response.data.song_id).toBe(payload.song_id);
    });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/setlists/${setlistId}/songs`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      data: {
        id: 'e176b4c7-a7d8-4c76-a2da-709b1c493052',
        setlist_id: setlistId,
        song_id: payload.song_id,
        position: 1,
        notes: null,
        created_at: '2026-08-20T18:10:00.000Z',
      },
    });
  });

  it('should remove only the song association from the setlist', () => {
    const setlistId = createApiSetlist().id;
    const songId = '8ed56b8d-8ef9-4441-830a-9a3b4354e8c7';

    service.removeSong(setlistId, songId).subscribe((response) => {
      expect(response.data).toEqual({ setlist_id: setlistId, song_id: songId });
    });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/setlists/${setlistId}/songs/${songId}`,
    );
    expect(request.request.method).toBe('DELETE');
    request.flush({ data: { setlist_id: setlistId, song_id: songId } });
  });

  it('should update a song position and notes inside the setlist', () => {
    const setlistId = createApiSetlist().id;
    const songId = '8ed56b8d-8ef9-4441-830a-9a3b4354e8c7';
    const payload = { position: 2, notes: 'Final seco' };

    service.updateSong(setlistId, songId, payload).subscribe((response) => {
      expect(response.data.position).toBe(2);
    });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/setlists/${setlistId}/songs/${songId}`,
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    request.flush({
      data: {
        id: 'relation-1',
        setlist_id: setlistId,
        song_id: songId,
        position: 2,
        notes: 'Final seco',
        created_at: '2026-08-20T18:10:00.000Z',
      },
    });
  });

  it('should soft delete the setlist through the API', () => {
    const setlistId = createApiSetlist().id;

    service.deleteSetlist(setlistId).subscribe((response) => {
      expect(response.data.id).toBe(setlistId);
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/setlists/${setlistId}`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ data: { id: setlistId } });
  });

  function createApiSetlist() {
    return {
      id: '6dd1df66-a088-4a5e-9411-b1e881359311',
      user_id: 'b06dce0f-3074-4db3-86c2-dd7365237313',
      name: 'Show de sábado',
      description: 'Repertório principal.',
      visibility: 'private',
      created_at: '2026-08-20T18:00:00.000Z',
      updated_at: '2026-08-20T18:00:00.000Z',
    } as const;
  }
});

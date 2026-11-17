import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { CreateSongRequest } from '../models/add-music.models';
import { LibraryService } from './library.service';

describe('LibraryService', () => {
  let service: LibraryService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(LibraryService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should retrieve the paginated song library contract', () => {
    service.getMusicLibrary().subscribe((response) => {
      expect(response.data[0].artist).toBe('Metallica');
      expect(response.meta).toEqual({ page: 1, limit: 20, total: 1 });
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/songs`);

    expect(request.request.method).toBe('GET');

    request.flush({
      data: [
        {
          id: 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62',
          user_id: '74c4b0fc-5e3b-48e5-8a5c-91f73b3af7bd',
          title: 'Enter Sandman',
          artist: 'Metallica',
          album: 'Metallica (Remastered)',
          genre: null,
          musical_key: 'Mi menor',
          capo: null,
          tuning: null,
          bpm: 124,
          difficulty: 'advanced',
          spotify_track_id: null,
          spotify_preview_url: null,
          spotify_external_url: null,
          cover_image_url: 'https://images.example.com/enter-sandman.jpg',
          notes: 'Técnicas em foco: Palm Mute, Alternate Picking',
          created_at: '2026-08-20T17:00:00.000Z',
          updated_at: '2026-08-20T17:00:00.000Z',
          deleted_at: null,
        },
      ],
      meta: { page: 1, limit: 20, total: 1 },
    });
  });

  it('should send the supported song list filters', () => {
    service
      .getMusicLibrary({
        page: 2,
        limit: 50,
        search: '  metallica  ',
        sort_by: 'title',
        sort_order: 'asc',
      })
      .subscribe();

    const request = httpTestingController.expectOne(
      (httpRequest) => httpRequest.url === `${environment.apiUrl}/songs`,
    );

    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('limit')).toBe('50');
    expect(request.request.params.get('search')).toBe('metallica');
    expect(request.request.params.get('sort_by')).toBe('title');
    expect(request.request.params.get('sort_order')).toBe('asc');
    request.flush({ data: [], meta: { page: 2, limit: 50, total: 0 } });
  });

  it('should create a song using the versioned Swagger contract', () => {
    const payload: CreateSongRequest = {
      title: 'Enter Sandman',
      artist: 'Metallica',
      album: 'Metallica (Remastered)',
      musical_key: 'Mi menor',
      bpm: 124,
      difficulty: 'advanced',
      cover_image_url: 'https://images.example.com/enter-sandman.jpg',
      notes: 'Técnicas em foco: Palm Mute, Alternate Picking',
    };

    service.createMusic(payload).subscribe((response) => {
      expect(response.data.title).toBe('Enter Sandman');
      expect(response.data.difficulty).toBe('advanced');
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/songs`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      data: {
        id: 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62',
        user_id: '74c4b0fc-5e3b-48e5-8a5c-91f73b3af7bd',
        title: payload.title,
        artist: payload.artist,
        album: payload.album,
        genre: null,
        musical_key: payload.musical_key,
        capo: null,
        tuning: null,
        bpm: payload.bpm,
        difficulty: payload.difficulty,
        spotify_track_id: null,
        spotify_preview_url: null,
        spotify_external_url: null,
        cover_image_url: payload.cover_image_url,
        notes: payload.notes,
        created_at: '2026-08-20T17:00:00.000Z',
        updated_at: '2026-08-20T17:00:00.000Z',
        deleted_at: null,
      },
    });
  });

  it('should retrieve one song by its UUID', () => {
    const musicId = 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62';

    service.getMusicDetails(musicId).subscribe((response) => {
      expect(response.data.id).toBe(musicId);
      expect(response.data.title).toBe('Enter Sandman');
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/songs/${musicId}`);

    expect(request.request.method).toBe('GET');

    request.flush({
      data: {
        id: musicId,
        user_id: '74c4b0fc-5e3b-48e5-8a5c-91f73b3af7bd',
        title: 'Enter Sandman',
        artist: 'Metallica',
        album: 'Metallica (Remastered)',
        genre: 'Metal',
        musical_key: 'Mi menor',
        capo: 0,
        tuning: 'E Standard',
        bpm: 124,
        difficulty: 'advanced',
        spotify_track_id: null,
        spotify_preview_url: null,
        spotify_external_url: null,
        cover_image_url: 'https://images.example.com/enter-sandman.jpg',
        notes: 'Técnicas em foco: Palm Mute, Alternate Picking',
        created_at: '2026-08-20T17:00:00.000Z',
        updated_at: '2026-08-20T17:00:00.000Z',
        deleted_at: null,
      },
    });
  });

  it('should update song metadata and replace its techniques', () => {
    const musicId = 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62';
    const techniqueId = 'ff373eed-d5ff-49f0-a0e3-243783494f87';

    service.updateMusic(musicId, { learning_status: 'learning', target_bpm: 132 }).subscribe();
    service.updateMusicTechniques(musicId, { technique_ids: [techniqueId] }).subscribe();

    const metadataRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/songs/${musicId}`,
    );
    const techniquesRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/songs/${musicId}/techniques`,
    );

    expect(metadataRequest.request.method).toBe('PATCH');
    expect(metadataRequest.request.body).toEqual({
      learning_status: 'learning',
      target_bpm: 132,
    });
    expect(techniquesRequest.request.method).toBe('PATCH');
    expect(techniquesRequest.request.body).toEqual({ technique_ids: [techniqueId] });
    metadataRequest.flush({ data: { id: musicId } });
    techniquesRequest.flush({ data: { id: musicId } });
  });

  it('should soft delete one song using the versioned Swagger contract', () => {
    const musicId = 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62';

    service.deleteMusic(musicId).subscribe((response) => {
      expect(response.data.id).toBe(musicId);
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/songs/${musicId}`);

    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toBeNull();

    request.flush({ data: { id: musicId } });
  });
});

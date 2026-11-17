import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { ApiRequestError } from '../../../../core/http/api-request.error';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { SongResponse } from '../../../library/models/add-music.models';
import { SetlistService } from '../../data-access/setlist.service';
import {
  SetlistDataResponse,
  SetlistListItemResponse,
  SetlistsListResponse,
  SetlistResponse,
} from '../../models/setlist.models';
import { Setlist } from './setlist';

describe('Setlist', () => {
  let component: Setlist;
  let fixture: ComponentFixture<Setlist>;
  const getSetlists = vi.fn();
  const createSetlist = vi.fn();
  const showSuccessToast = vi.fn();
  const showErrorToast = vi.fn();
  const apiSetlist: SetlistResponse = {
    id: '6dd1df66-a088-4a5e-9411-b1e881359311',
    user_id: 'b06dce0f-3074-4db3-86c2-dd7365237313',
    name: 'Show de sábado',
    description: 'Repertório principal.',
    visibility: 'private',
    created_at: '2026-08-20T18:00:00.000Z',
    updated_at: '2026-08-20T18:00:00.000Z',
  };
  const apiSong: SongResponse = {
    id: '8ed56b8d-8ef9-4441-830a-9a3b4354e8c7',
    user_id: apiSetlist.user_id,
    title: 'Enter Sandman',
    artist: 'Metallica',
    album: 'Metallica (Remastered)',
    genre: 'Metal',
    musical_key: 'Mi menor',
    capo: null,
    tuning: 'E Standard',
    bpm: 123,
    difficulty: 'intermediate',
    spotify_track_id: null,
    spotify_preview_url: null,
    spotify_external_url: null,
    cover_image_url: 'https://images.example.com/enter-sandman.jpg',
    notes: null,
    duration_seconds: 300,
    created_at: apiSetlist.created_at,
    updated_at: apiSetlist.updated_at,
    deleted_at: null,
  };
  const apiSetlistDetails: SetlistListItemResponse = {
    ...apiSetlist,
    song_count: 1,
    duration_seconds: 300,
    missing_duration_count: 0,
    cover_image_urls: [apiSong.cover_image_url!],
  };
  let setlistsRequest$: Subject<SetlistsListResponse>;
  let createSetlistRequest$: Subject<SetlistDataResponse>;

  beforeEach(async () => {
    vi.clearAllMocks();
    setlistsRequest$ = new Subject<SetlistsListResponse>();
    createSetlistRequest$ = new Subject<SetlistDataResponse>();
    getSetlists.mockReturnValue(setlistsRequest$.asObservable());
    createSetlist.mockReturnValue(createSetlistRequest$.asObservable());

    await TestBed.configureTestingModule({
      imports: [Setlist],
      providers: [
        {
          provide: SetlistService,
          useValue: { getSetlists, createSetlist },
        },
        {
          provide: ToastrNotificationService,
          useValue: { success: showSuccessToast, error: showErrorToast },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Setlist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should request and render the authenticated setlist collection', () => {
    expect(component.isLoading).toBe(true);
    expect(getSetlists).toHaveBeenCalledWith({
      page: 1,
      limit: 6,
      sort_by: 'updated_at',
      sort_order: 'desc',
    });
    expect(fixture.nativeElement.querySelector('app-content-skeleton-loading')).toBeTruthy();

    completeSetlistsRequest();
    fixture.detectChanges();

    expect(component.setlists).toHaveLength(1);
    expect(component.setlists[0]).toMatchObject({
      id: apiSetlist.id,
      title: apiSetlist.name,
      description: apiSetlist.description,
      songCount: 1,
      duration: '5 min',
    });
    expect(component.setlists[0].artworkUrls[0]).toBe(apiSong.cover_image_url);
    expect(component.totalSongs).toBe(1);
    expect(fixture.nativeElement.querySelector('app-setlist-card')).toBeTruthy();
  });

  it('should label partial durations without inventing durations for missing songs', () => {
    setlistsRequest$.next({
      data: [{ ...apiSetlistDetails, song_count: 2, missing_duration_count: 1 }],
      meta: { page: 1, limit: 6, total: 1 },
    });
    setlistsRequest$.complete();
    expect(component.setlists[0].duration).toBe('5 min (parcial)');
    expect(component.setlists[0].songCount).toBe(2);
  });

  it('should keep every page section on the Bootstrap page grid', () => {
    completeSetlistsRequest();
    fixture.detectChanges();

    const sections = fixture.nativeElement.querySelectorAll('#setlist-page > section');

    expect(sections.length).toBeGreaterThan(0);
    sections.forEach((section: HTMLElement) => {
      expect(section.querySelector('.container > .row > [class*="col-12"]')).toBeTruthy();
    });
    expect(fixture.nativeElement.querySelector('#setlist-page section section')).toBeNull();
  });

  it('should adapt the draft and refresh the first page after creating a setlist', () => {
    completeSetlistsRequest();
    fixture.detectChanges();
    component.openCreatePanel();

    component.createSetlist({
      title: ' Festival da Cidade ',
      context: 'Show',
      description: ' Repertório principal para a apresentação de sábado. ',
    });

    expect(component.isCreating).toBe(true);
    expect(createSetlist).toHaveBeenCalledWith({
      name: 'Festival da Cidade',
      description: 'Repertório principal para a apresentação de sábado.',
      visibility: 'private',
    });

    const refreshedSetlistsRequest$ = new Subject<SetlistsListResponse>();
    getSetlists.mockReturnValue(refreshedSetlistsRequest$.asObservable());
    const createdSetlistDetails: SetlistListItemResponse = {
      ...apiSetlistDetails,
      name: 'Festival da Cidade',
      song_count: 0,
      duration_seconds: 0,
      cover_image_urls: [],
    };

    createSetlistRequest$.next({ data: createdSetlistDetails });
    createSetlistRequest$.complete();
    refreshedSetlistsRequest$.next({
      data: [createdSetlistDetails],
      meta: { page: 1, limit: 6, total: 2 },
    });
    refreshedSetlistsRequest$.complete();
    fixture.detectChanges();

    expect(component.isCreating).toBe(false);
    expect(component.isCreatePanelOpen).toBe(false);
    expect(component.setlists[0]).toMatchObject({
      title: 'Festival da Cidade',
      context: 'Repertório',
      songCount: 0,
      duration: '0 min',
    });
    expect(getSetlists).toHaveBeenLastCalledWith({
      page: 1,
      limit: 6,
      sort_by: 'updated_at',
      sort_order: 'desc',
    });
    expect(showSuccessToast).toHaveBeenCalledWith(
      'Seu repertório está pronto para receber músicas.',
      'Setlist criado',
    );
  });

  it('should show contextual errors for collection and creation requests', () => {
    setlistsRequest$.error(new ApiRequestError('Unauthorized', 401));
    fixture.detectChanges();

    expect(component.loadErrorMessage).toContain('Sua sessão expirou');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      component.loadErrorMessage,
    );
  });

  it('should alternate the setlist cards between grid and list views', () => {
    completeSetlistsRequest();
    fixture.detectChanges();

    const listButton = fixture.nativeElement.querySelector(
      'button[aria-label="Visualizar em lista"]',
    ) as HTMLButtonElement;
    listButton.click();
    fixture.detectChanges();

    const setlistColumn = fixture.nativeElement.querySelector(
      '.setlist-collection-grid-custom > div',
    );
    const setlistCard = fixture.nativeElement.querySelector('app-setlist-card article');

    expect(setlistColumn.classList).not.toContain('col-md-6');
    expect(setlistCard.classList).toContain('setlist-card-custom--list');
  });

  it('should paginate the setlist collection using the API metadata', () => {
    completeSetlistsRequest({ page: 1, limit: 6, total: 14 });
    fixture.detectChanges();

    expect(component.totalSetlists).toBe(14);
    expect(component.totalSongs).toBeNull();
    expect(fixture.nativeElement.querySelector('app-pagination')).toBeTruthy();

    const secondPageRequest$ = new Subject<SetlistsListResponse>();
    getSetlists.mockReturnValue(secondPageRequest$.asObservable());
    component.selectPage(2);

    expect(getSetlists).toHaveBeenLastCalledWith({
      page: 2,
      limit: 6,
      sort_by: 'updated_at',
      sort_order: 'desc',
    });
    expect(component.isLoading).toBe(true);
  });

  function completeSetlistsRequest(meta = { page: 1, limit: 6, total: 1 }): void {
    setlistsRequest$.next({
      data: [apiSetlistDetails],
      meta,
    });
    setlistsRequest$.complete();
  }
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { MusicDetailsEditor } from './music-details-editor';

describe('MusicDetailsEditor', () => {
  let component: MusicDetailsEditor;
  let fixture: ComponentFixture<MusicDetailsEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicDetailsEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(MusicDetailsEditor);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('song', {
      id: 'song-id',
      user_id: 'user-id',
      title: 'Enter Sandman',
      artist: 'Metallica',
      album: 'Metallica',
      genre: 'Metal',
      musical_key: 'Mi menor',
      capo: null,
      tuning: 'E Standard',
      bpm: 123,
      difficulty: 'intermediate',
      spotify_track_id: null,
      spotify_preview_url: null,
      spotify_external_url: null,
      cover_image_url: null,
      notes: null,
      created_at: '2026-09-30T00:00:00.000Z',
      updated_at: '2026-09-30T00:00:00.000Z',
      deleted_at: null,
    });
    fixture.componentRef.setInput('techniques', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the editable song fields and selected techniques', () => {
    const saved = vi.fn();
    component.saved.subscribe(saved);
    component.form.patchValue({ targetBpm: 140, priority: 3, learningStatus: 'maintaining' });
    component.updateSelectedTechniqueIds(['technique-id']);

    component.submit();

    expect(saved).toHaveBeenCalledWith({
      song: expect.objectContaining({
        target_bpm: 140,
        priority: 3,
        learning_status: 'maintaining',
      }),
      techniqueIds: ['technique-id'],
    });
  });
});

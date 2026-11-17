import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../../../../shared/ui/button/button';
import { TechniqueSelector } from '../../../techniques/components/technique-selector/technique-selector';
import { Technique } from '../../../techniques/models/technique.models';
import { SongLearningStatus, SongResponse } from '../../models/add-music.models';
import { MusicDetailsEditorValue } from '../../models/music-details.models';

@Component({
  selector: 'app-music-details-editor',
  imports: [ReactiveFormsModule, Button, TechniqueSelector],
  templateUrl: './music-details-editor.html',
  styleUrl: './music-details-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicDetailsEditor implements OnChanges {
  private readonly _formBuilder = inject(FormBuilder);

  readonly song = input.required<SongResponse>();
  readonly techniques = input.required<readonly Technique[]>();
  readonly isLoadingTechniques = input(false);
  readonly techniquesErrorMessage = input('');
  readonly isSaving = input(false);
  readonly retryTechniquesRequested = output<void>();
  readonly saved = output<MusicDetailsEditorValue>();

  selectedTechniqueIds: readonly string[] = [];

  readonly form = this._formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    artist: ['', [Validators.required, Validators.maxLength(200)]],
    bpm: [72, [Validators.required, Validators.min(1), Validators.max(400)]],
    targetBpm: [72, [Validators.required, Validators.min(1), Validators.max(400)]],
    priority: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    learningStatus: ['learning', Validators.required],
    notes: ['', Validators.maxLength(5000)],
  });

  protected readonly learningStatusOptions = [
    { value: 'new', label: 'Nova' },
    { value: 'learning', label: 'Aprendendo' },
    { value: 'maintaining', label: 'Em manutenção' },
    { value: 'mastered', label: 'Dominada' },
    { value: 'archived', label: 'Arquivada' },
  ] as const;

  ngOnChanges(): void {
    const song = this.song();
    this.form.patchValue({
      title: song.title,
      artist: song.artist,
      bpm: song.bpm ?? 72,
      targetBpm: song.target_bpm ?? song.bpm ?? 72,
      priority: song.priority ?? 0,
      learningStatus: song.learning_status ?? 'learning',
      notes: song.notes ?? '',
    });
    this.selectedTechniqueIds = song.song_techniques?.map(({ techniques }) => techniques.id) ?? [];
  }

  public updateSelectedTechniqueIds(techniqueIds: readonly string[]): void {
    this.selectedTechniqueIds = techniqueIds;
  }

  public submit(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saved.emit({
      song: {
        title: value.title.trim(),
        artist: value.artist.trim(),
        bpm: value.bpm,
        target_bpm: value.targetBpm,
        priority: value.priority,
        learning_status: value.learningStatus as SongLearningStatus,
        notes: value.notes.trim(),
      },
      techniqueIds: this.selectedTechniqueIds,
    });
  }
}

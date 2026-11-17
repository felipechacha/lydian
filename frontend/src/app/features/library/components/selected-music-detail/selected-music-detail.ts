import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from '../../../../shared/ui/button/button';
import { TechniqueSelector } from '../../../techniques/components/technique-selector/technique-selector';
import { Technique } from '../../../techniques/models/technique.models';
import { MusicSearchResult } from '../../models/add-music.models';

interface DifficultyOption {
  readonly label: string;
  readonly level: number;
}

@Component({
  selector: 'app-selected-music-detail',
  imports: [NgOptimizedImage, ReactiveFormsModule, RouterLink, Button, TechniqueSelector],
  templateUrl: './selected-music-detail.html',
  styleUrl: './selected-music-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedMusicDetail implements OnChanges {
  readonly music = input.required<MusicSearchResult>();
  readonly isAdded = input.required<boolean>();
  readonly isAdding = input(false);
  readonly addErrorMessage = input('');
  readonly availableTechniques = input.required<readonly Technique[]>();
  readonly isLoadingTechniques = input(false);
  readonly techniqueErrorMessage = input('');
  readonly musicAdded = output<MusicSearchResult>();
  readonly techniquesRetryRequested = output<void>();

  private readonly _formBuilder = inject(FormBuilder);
  private readonly _difficultyLevels: readonly number[] = [1, 2, 3];
  private readonly _difficultyOptions: readonly DifficultyOption[] = [
    { label: 'Fácil', level: 1 },
    { label: 'Intermediário', level: 2 },
    { label: 'Difícil', level: 3 },
  ];

  readonly musicForm = this._formBuilder.nonNullable.group({
    bpm: [72, [Validators.required, Validators.min(1), Validators.max(400)]],
    key: ['', [Validators.required, Validators.maxLength(20)]],
    genre: ['', Validators.maxLength(100)],
    capo: [
      0,
      [Validators.required, Validators.min(0), Validators.max(24), Validators.pattern(/^\d+$/)],
    ],
    tuning: ['', Validators.maxLength(50)],
    difficulty: ['Intermediário', Validators.required],
    techniqueIds: this._formBuilder.nonNullable.control<readonly string[]>(
      [],
      [Validators.required, Validators.minLength(1)],
    ),
  });

  ngOnChanges(changes: SimpleChanges): void {
    const selectedMusic = changes['music']?.currentValue as MusicSearchResult | undefined;

    if (selectedMusic) {
      this._populateMusicForm(selectedMusic);
    }
  }

  get difficultyLevels(): readonly number[] {
    return this._difficultyLevels;
  }

  get difficultyOptions(): readonly DifficultyOption[] {
    return this._difficultyOptions;
  }

  get selectedTechniqueIds(): readonly string[] {
    return this.musicForm.controls.techniqueIds.value;
  }

  get selectedDifficultyLevel(): number {
    return (
      this._difficultyOptions.find(
        (difficultyOption) => difficultyOption.label === this.musicForm.controls.difficulty.value,
      )?.level ?? 1
    );
  }

  public applyDifficultyClass(level: number): string {
    const activeClass =
      level <= this.selectedDifficultyLevel ? ' difficulty-meter-custom--active' : '';
    return `difficulty-meter-custom${activeClass}`;
  }

  public applyDifficultyOptionClass(difficultyOption: DifficultyOption): string {
    const activeClass =
      difficultyOption.label === this.musicForm.controls.difficulty.value
        ? ' difficulty-option-custom--active'
        : '';
    return `difficulty-option-custom${activeClass}`;
  }

  public selectDifficulty(difficultyOption: DifficultyOption): void {
    this.musicForm.controls.difficulty.setValue(difficultyOption.label);
    this.musicForm.controls.difficulty.markAsDirty();
  }

  public updateSelectedTechniqueIds(techniqueIds: readonly string[]): void {
    this.musicForm.controls.techniqueIds.setValue(techniqueIds);
    this.musicForm.controls.techniqueIds.markAsDirty();
    this.musicForm.controls.techniqueIds.markAsTouched();
  }

  public submitMusic(): void {
    this.musicForm.markAllAsTouched();
    this.musicForm.controls.techniqueIds.markAsTouched();

    if (this.musicForm.invalid || this.isAdded() || this.isAdding()) {
      return;
    }

    const formValue = this.musicForm.getRawValue();

    this.musicAdded.emit({
      ...this.music(),
      bpm: formValue.bpm,
      key: formValue.key.trim(),
      genre: formValue.genre.trim(),
      capo: formValue.capo,
      tuning: formValue.tuning.trim(),
      difficulty: formValue.difficulty,
      difficultyLevel: this.selectedDifficultyLevel,
      techniques: this._resolveTechniqueNames(formValue.techniqueIds),
      techniqueIds: formValue.techniqueIds,
    });
  }

  private _populateMusicForm(music: MusicSearchResult): void {
    this.musicForm.patchValue(
      {
        bpm: music.bpm,
        key: music.key,
        genre: music.genre ?? '',
        capo: music.capo,
        tuning: music.tuning,
        difficulty: music.difficulty,
        techniqueIds: music.techniqueIds ?? [],
      },
      { emitEvent: false },
    );
    this.musicForm.markAsPristine();
    this.musicForm.markAsUntouched();
  }

  private _resolveTechniqueNames(techniqueIds: readonly string[]): readonly string[] {
    const techniqueNamesById = new Map(
      this.availableTechniques().map((technique) => [technique.id, technique.name]),
    );

    return techniqueIds.flatMap((techniqueId) => {
      const techniqueName = techniqueNamesById.get(techniqueId);
      return techniqueName ? [techniqueName] : [];
    });
  }
}

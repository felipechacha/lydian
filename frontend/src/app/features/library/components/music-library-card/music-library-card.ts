import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentViewMode } from '../../../../shared/ui/view-mode-toggle/view-mode-toggle';
import { LibraryMusic, LibraryMusicStatus, MusicDifficulty } from '../../models/musics.models';

@Component({
  selector: 'app-music-library-card',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './music-library-card.html',
  styleUrl: './music-library-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicLibraryCard {
  private readonly _artworkFallbackUrl = '/images/music-cover-placeholder.svg';

  readonly music = input.required<LibraryMusic<string | number>>();
  readonly viewMode = input.required<ContentViewMode>();

  public applyCardClass(): string {
    return `music-library-card-custom music-library-card-custom--${this.viewMode()}`;
  }

  public applyDifficultyClass(difficulty: MusicDifficulty): string {
    const difficultyClass: Record<MusicDifficulty, string> = {
      Fácil: 'easy',
      Médio: 'medium',
      Difícil: 'hard',
    };

    return `music-difficulty-custom music-difficulty-custom--${difficultyClass[difficulty]}`;
  }

  public applyStatusClass(status: LibraryMusicStatus): string {
    return `music-status-custom music-status-custom--${status}`;
  }

  public getStatusLabel(status: LibraryMusicStatus): string {
    const labelsByStatus: Record<LibraryMusicStatus, string> = {
      new: 'Nova',
      learning: 'Aprendendo',
      maintaining: 'Em manutenção',
      mastered: 'Dominada',
      archived: 'Arquivada',
      practicing: 'Praticando',
    };

    return labelsByStatus[status];
  }

  public formatDuration(durationSeconds: number | null | undefined): string {
    if (durationSeconds === null || durationSeconds === undefined) {
      return 'Duração —';
    }

    const minutes = Math.floor(durationSeconds / 60);
    const seconds = String(durationSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  public formatLastPracticedAt(lastPracticedAt: string | null | undefined): string {
    if (!lastPracticedAt) {
      return 'Ainda não praticada';
    }

    return `Praticada em ${new Intl.DateTimeFormat('pt-BR').format(new Date(lastPracticedAt))}`;
  }

  public handleArtworkError(event: Event): void {
    const artworkImage = event.target as HTMLImageElement | null;

    if (!artworkImage || artworkImage.dataset['fallbackApplied'] === 'true') {
      return;
    }

    artworkImage.dataset['fallbackApplied'] = 'true';
    artworkImage.src = this._artworkFallbackUrl;
  }
}

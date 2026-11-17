import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LibraryMusic } from '../../models/musics.models';

@Component({
  selector: 'app-music-details-hero',
  imports: [RouterLink],
  templateUrl: './music-details-hero.html',
  styleUrl: './music-details-hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicDetailsHero {
  private readonly _artworkFallbackUrl = '/images/music-cover-placeholder.svg';

  @Input({ required: true }) music!: LibraryMusic<string | number>;
  @Input() isSaved = false;
  @Input() isDeleting = false;
  @Input() isCreatingPractice = false;
  @Output() readonly saveToggled = new EventEmitter<void>();
  @Output() readonly deleteRequested = new EventEmitter<void>();
  @Output() readonly practiceRequested = new EventEmitter<void>();

  get statusLabel(): string {
    const labels: Record<LibraryMusic['status'], string> = {
      new: 'Nova',
      learning: 'Aprendendo',
      practicing: 'Em prática',
      maintaining: 'Em manutenção',
      mastered: 'Dominada',
      archived: 'Arquivada',
    };

    return labels[this.music.status];
  }

  get artworkIndex(): string {
    const musicId = this.music.id.toString();
    const numericMusicId = Number(musicId);

    return Number.isInteger(numericMusicId)
      ? musicId.padStart(2, '0')
      : musicId.slice(0, 2).toUpperCase();
  }

  get durationLabel(): string | null {
    if (!this.music.durationSeconds) {
      return null;
    }

    const minutes = Math.floor(this.music.durationSeconds / 60);
    const seconds = this.music.durationSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get lastPracticedLabel(): string | null {
    if (!this.music.lastPracticedAt) {
      return null;
    }

    const date = new Date(this.music.lastPracticedAt);
    return Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
          .format(date)
          .replace('.', '')
      : null;
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

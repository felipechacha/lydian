import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppleMusicSearchResult } from '../../models/add-music.models';

@Component({
  selector: 'app-music-search-results',
  imports: [NgOptimizedImage],
  templateUrl: './music-search-results.html',
  styleUrl: './music-search-results.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicSearchResults {
  readonly musics = input.required<readonly AppleMusicSearchResult[]>();
  readonly searchQuery = input.required<string>();
  readonly isLoading = input.required<boolean>();
  readonly hasSearched = input.required<boolean>();
  readonly searchErrorMessage = input.required<string>();
  readonly previewErrorMessage = input.required<string>();
  readonly selectedMusicId = input.required<number | null>();
  readonly activePreviewMusicId = input.required<number | null>();
  readonly previewProgressPercentage = input.required<number>();
  readonly previewRemainingSeconds = input.required<number>();
  readonly searchQueryChanged = output<string>();
  readonly musicSelected = output<AppleMusicSearchResult>();
  readonly previewToggled = output<AppleMusicSearchResult>();

  public updateSearchQuery(event: Event): void {
    const searchInput = event.target as HTMLInputElement;
    this.searchQueryChanged.emit(searchInput.value);
  }

  public clearSearchQuery(): void {
    this.searchQueryChanged.emit('');
  }

  public applyResultClass(musicId: number): string {
    const selectedClass =
      this.selectedMusicId() === musicId ? ' music-result-custom--selected' : '';
    const playingClass =
      this.activePreviewMusicId() === musicId ? ' music-result-custom--playing' : '';
    return `music-result-custom${selectedClass}${playingClass}`;
  }

  public getPreviewButtonLabel(music: AppleMusicSearchResult): string {
    if (!music.previewUrl) {
      return `Prévia indisponível para ${music.title}`;
    }

    if (this.activePreviewMusicId() !== music.id) {
      return `Reproduzir prévia de ${music.title}`;
    }

    const remainingTimeLabel = this._formatRemainingTime(this.previewRemainingSeconds());
    const remainingLabel = remainingTimeLabel ? `, ${remainingTimeLabel} restantes` : '';
    return `Pausar prévia de ${music.title}${remainingLabel}`;
  }

  public getPreviewProgressStyle(musicId: number): string {
    if (this.activePreviewMusicId() !== musicId) {
      return '0%';
    }

    const normalizedProgress = Math.min(100, Math.max(0, this.previewProgressPercentage()));
    return `${normalizedProgress}%`;
  }

  public getPreviewRemainingLabel(musicId: number): string | null {
    if (this.activePreviewMusicId() !== musicId) {
      return null;
    }

    const remainingTimeLabel = this._formatRemainingTime(this.previewRemainingSeconds());
    return remainingTimeLabel ? `${remainingTimeLabel} restantes` : null;
  }

  private _formatRemainingTime(remainingSeconds: number): string {
    if (!Number.isFinite(remainingSeconds) || remainingSeconds <= 0) {
      return '';
    }

    const normalizedSeconds = Math.ceil(remainingSeconds);
    const minutes = Math.floor(normalizedSeconds / 60);
    const seconds = String(normalizedSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}
